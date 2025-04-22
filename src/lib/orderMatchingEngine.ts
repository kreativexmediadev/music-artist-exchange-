import { prisma } from './prisma';
import { WebSocketManager } from './websocket';

interface Order {
  id: string;
  userId: string;
  artistId: string;
  type: 'BUY' | 'SELL';
  amount: number;
  price: number;
  status: 'PENDING' | 'FILLED' | 'CANCELLED';
  createdAt: Date;
}

export class OrderMatchingEngine {
  private wsManager: WebSocketManager;

  constructor(wsManager: WebSocketManager) {
    this.wsManager = wsManager;
  }

  async processOrder(order: Order): Promise<void> {
    try {
      // Get matching orders
      const matchingOrders = await this.findMatchingOrders(order);

      if (matchingOrders.length === 0) {
        // No matching orders, store the order in the order book
        await this.storeOrder(order);
        return;
      }

      let remainingAmount = order.amount;

      // Process matching orders
      for (const matchingOrder of matchingOrders) {
        if (remainingAmount <= 0) break;

        const tradeAmount = Math.min(remainingAmount, matchingOrder.amount);
        const tradePrice = matchingOrder.price;

        // Execute the trade
        await this.executeTrade({
          buyOrderId: order.type === 'BUY' ? order.id : matchingOrder.id,
          sellOrderId: order.type === 'SELL' ? order.id : matchingOrder.id,
          amount: tradeAmount,
          price: tradePrice,
          artistId: order.artistId,
        });

        remainingAmount -= tradeAmount;

        // Update order status
        await this.updateOrderStatus(matchingOrder.id, tradeAmount);
      }

      // If there's remaining amount, store it as a new order
      if (remainingAmount > 0) {
        await this.storeOrder({
          ...order,
          amount: remainingAmount,
        });
      }

      // Update artist price
      await this.updateArtistPrice(order.artistId);
    } catch (error) {
      console.error('Error processing order:', error);
      throw error;
    }
  }

  private async findMatchingOrders(order: Order) {
    const oppositeType = order.type === 'BUY' ? 'SELL' : 'BUY';
    const priceComparison = order.type === 'BUY' ? 
      { lte: order.price } : 
      { gte: order.price };

    return prisma.order.findMany({
      where: {
        artistId: order.artistId,
        type: oppositeType,
        status: 'PENDING',
        price: priceComparison,
      },
      orderBy: {
        price: order.type === 'BUY' ? 'asc' : 'desc',
        createdAt: 'asc',
      },
    });
  }

  private async storeOrder(order: Order) {
    const storedOrder = await prisma.order.create({
      data: {
        userId: order.userId,
        artistId: order.artistId,
        type: order.type,
        amount: order.amount,
        price: order.price,
        status: 'PENDING',
      },
    });

    this.wsManager.broadcastOrderUpdate({
      type: 'NEW',
      orderId: storedOrder.id,
      artistId: order.artistId,
      price: order.price,
      amount: order.amount,
      orderType: order.type,
    });
  }

  private async executeTrade({
    buyOrderId,
    sellOrderId,
    amount,
    price,
    artistId,
  }: {
    buyOrderId: string;
    sellOrderId: string;
    amount: number;
    price: number;
    artistId: string;
  }) {
    // Create trade record
    const trade = await prisma.trade.create({
      data: {
        orderId: buyOrderId,
        artistId,
        amount,
        price,
      },
    });

    // Update user balances
    const [buyOrder, sellOrder] = await Promise.all([
      prisma.order.findUnique({ where: { id: buyOrderId }, include: { user: true } }),
      prisma.order.findUnique({ where: { id: sellOrderId }, include: { user: true } }),
    ]);

    if (!buyOrder || !sellOrder) {
      throw new Error('Order not found');
    }

    // Update user portfolios
    await Promise.all([
      this.updateUserPortfolio(buyOrder.userId, artistId, amount, 'BUY'),
      this.updateUserPortfolio(sellOrder.userId, artistId, amount, 'SELL'),
    ]);

    // Notify users
    this.wsManager.sendUserUpdate(buyOrder.userId, {
      type: 'TRADE_EXECUTED',
      trade,
      orderType: 'BUY',
    });

    this.wsManager.sendUserUpdate(sellOrder.userId, {
      type: 'TRADE_EXECUTED',
      trade,
      orderType: 'SELL',
    });
  }

  private async updateOrderStatus(orderId: string, filledAmount: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) return;

    const newStatus = filledAmount >= order.amount ? 'FILLED' : 'PENDING';
    const remainingAmount = order.amount - filledAmount;

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        amount: remainingAmount,
      },
    });
  }

  private async updateArtistPrice(artistId: string) {
    // Get latest trade price
    const latestTrade = await prisma.trade.findFirst({
      where: { artistId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latestTrade) return;

    // Get 24h ago price for price change calculation
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oldTrade = await prisma.trade.findFirst({
      where: {
        artistId,
        createdAt: {
          lte: yesterday,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const oldPrice = oldTrade?.price || latestTrade.price;
    const priceChange24h = ((latestTrade.price - oldPrice) / oldPrice) * 100;

    // Update artist price
    await prisma.artist.update({
      where: { id: artistId },
      data: {
        currentPrice: latestTrade.price,
        priceChange24h,
      },
    });

    // Broadcast price update
    this.wsManager.broadcastPriceUpdate({
      artistId,
      price: latestTrade.price,
      change24h: priceChange24h,
      timestamp: Date.now(),
    });
  }

  private async updateUserPortfolio(
    userId: string,
    artistId: string,
    amount: number,
    type: 'BUY' | 'SELL'
  ) {
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_artistId: {
          userId,
          artistId,
        },
      },
    });

    const tokenAmount = type === 'BUY' ? amount : -amount;

    if (portfolio) {
      await prisma.portfolio.update({
        where: {
          userId_artistId: {
            userId,
            artistId,
          },
        },
        data: {
          amount: portfolio.amount + tokenAmount,
        },
      });
    } else {
      await prisma.portfolio.create({
        data: {
          userId,
          artistId,
          amount: tokenAmount,
        },
      });
    }
  }
} 