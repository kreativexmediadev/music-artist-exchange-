import { Decimal } from '@prisma/client/runtime/library';
import { OrderBook, Order, Trade } from './OrderBook';
import { WebSocketManager } from '../websocket';
import { prisma } from '../prisma';
import { v4 as uuidv4 } from 'uuid';

export class MatchingEngine {
  private orderBooks: Map<string, OrderBook> = new Map();
  
  constructor(private wsManager: WebSocketManager) {}

  private getOrCreateOrderBook(artistId: string): OrderBook {
    if (!this.orderBooks.has(artistId)) {
      this.orderBooks.set(artistId, new OrderBook(artistId));
    }
    return this.orderBooks.get(artistId)!;
  }

  async processOrder(order: Omit<Order, 'id' | 'timestamp' | 'status'>): Promise<Order> {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      timestamp: new Date(),
      status: 'PENDING'
    };

    const orderBook = this.getOrCreateOrderBook(order.artistId);
    const trades: Trade[] = [];

    if (order.type === 'BUY') {
      await this.matchBuyOrder(newOrder, orderBook, trades);
    } else {
      await this.matchSellOrder(newOrder, orderBook, trades);
    }

    // If order is not fully filled, add it to the order book
    if (newOrder.amount > 0) {
      orderBook.addOrder(newOrder);
      this.broadcastOrderBookUpdate(order.artistId);
    }

    return newOrder;
  }

  private async matchBuyOrder(order: Order, orderBook: OrderBook, trades: Trade[]): Promise<void> {
    while (order.amount > 0) {
      const bestAsk = orderBook.getBestAsk();
      if (!bestAsk || bestAsk.price.comparedTo(order.price) > 0) {
        break; // No matching sell orders at or below buy price
      }

      const matchingOrders = orderBook.getSellOrdersAtPrice(bestAsk.price);
      for (const sellOrder of matchingOrders) {
        if (order.amount === 0) break;

        const matchAmount = Math.min(order.amount, sellOrder.amount);
        const trade: Trade = {
          id: uuidv4(),
          buyOrderId: order.id,
          sellOrderId: sellOrder.id,
          artistId: order.artistId,
          price: sellOrder.price,
          amount: matchAmount,
          timestamp: new Date()
        };

        // Update orders
        order.amount -= matchAmount;
        sellOrder.amount -= matchAmount;
        
        // Update order statuses
        order.status = order.amount === 0 ? 'FILLED' : 'PARTIALLY_FILLED';
        sellOrder.status = sellOrder.amount === 0 ? 'FILLED' : 'PARTIALLY_FILLED';

        // Remove filled sell order from order book
        if (sellOrder.amount === 0) {
          orderBook.removeOrder(sellOrder.id);
        }

        trades.push(trade);
        await this.processTrade(trade);
      }
    }
  }

  private async matchSellOrder(order: Order, orderBook: OrderBook, trades: Trade[]): Promise<void> {
    while (order.amount > 0) {
      const bestBid = orderBook.getBestBid();
      if (!bestBid || bestBid.price.comparedTo(order.price) < 0) {
        break; // No matching buy orders at or above sell price
      }

      const matchingOrders = orderBook.getBuyOrdersAtPrice(bestBid.price);
      for (const buyOrder of matchingOrders) {
        if (order.amount === 0) break;

        const matchAmount = Math.min(order.amount, buyOrder.amount);
        const trade: Trade = {
          id: uuidv4(),
          buyOrderId: buyOrder.id,
          sellOrderId: order.id,
          artistId: order.artistId,
          price: buyOrder.price,
          amount: matchAmount,
          timestamp: new Date()
        };

        // Update orders
        order.amount -= matchAmount;
        buyOrder.amount -= matchAmount;
        
        // Update order statuses
        order.status = order.amount === 0 ? 'FILLED' : 'PARTIALLY_FILLED';
        buyOrder.status = buyOrder.amount === 0 ? 'FILLED' : 'PARTIALLY_FILLED';

        // Remove filled buy order from order book
        if (buyOrder.amount === 0) {
          orderBook.removeOrder(buyOrder.id);
        }

        trades.push(trade);
        await this.processTrade(trade);
      }
    }
  }

  private async processTrade(trade: Trade): Promise<void> {
    // Save trade to database
    await prisma.trade.create({
      data: {
        id: trade.id,
        buyOrderId: trade.buyOrderId,
        sellOrderId: trade.sellOrderId,
        artistId: trade.artistId,
        price: trade.price,
        amount: trade.amount,
        timestamp: trade.timestamp
      }
    });

    // Update artist price
    await prisma.artist.update({
      where: { id: trade.artistId },
      data: {
        currentPrice: trade.price,
        lastTradeTimestamp: trade.timestamp
      }
    });

    // Broadcast trade
    this.wsManager.broadcastOrderUpdate({
      type: 'MATCHED',
      orderId: trade.buyOrderId,
      artistId: trade.artistId,
      price: trade.price.toNumber(),
      amount: trade.amount,
      orderType: 'BUY'
    });

    // Broadcast price update
    this.wsManager.broadcastPriceUpdate({
      artistId: trade.artistId,
      price: trade.price.toNumber(),
      change24h: await this.calculate24HourPriceChange(trade.artistId),
      timestamp: trade.timestamp.getTime()
    });
  }

  private async calculate24HourPriceChange(artistId: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const oldPrice = await prisma.trade.findFirst({
      where: {
        artistId,
        timestamp: {
          lte: oneDayAgo
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        price: true
      }
    });

    const latestPrice = await prisma.trade.findFirst({
      where: {
        artistId
      },
      orderBy: {
        timestamp: 'desc'
      },
      select: {
        price: true
      }
    });

    if (!oldPrice || !latestPrice) return 0;

    const priceChange = latestPrice.price.minus(oldPrice.price)
      .dividedBy(oldPrice.price)
      .multipliedBy(100)
      .toNumber();

    return priceChange;
  }

  private broadcastOrderBookUpdate(artistId: string): void {
    const orderBook = this.getOrCreateOrderBook(artistId);
    const snapshot = orderBook.getOrderBookSnapshot();
    
    this.wsManager.broadcastToArtist(artistId, {
      type: 'ORDER_BOOK_UPDATE',
      data: snapshot
    });
  }

  // Public methods for order management
  async cancelOrder(orderId: string): Promise<boolean> {
    for (const orderBook of this.orderBooks.values()) {
      const order = orderBook.getOrder(orderId);
      if (order) {
        orderBook.removeOrder(orderId);
        
        // Update order status in database
        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'CANCELLED' }
        });

        // Broadcast cancellation
        this.wsManager.broadcastOrderUpdate({
          type: 'CANCELLED',
          orderId,
          artistId: order.artistId,
          price: order.price.toNumber(),
          amount: order.amount,
          orderType: order.type
        });

        this.broadcastOrderBookUpdate(order.artistId);
        return true;
      }
    }
    return false;
  }

  getOrderBookSnapshot(artistId: string, depth: number = 10) {
    const orderBook = this.getOrCreateOrderBook(artistId);
    return orderBook.getOrderBookSnapshot(depth);
  }
} 