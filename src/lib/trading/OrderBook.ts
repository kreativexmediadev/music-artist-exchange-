import { Decimal } from '@prisma/client/runtime/library';

export interface Order {
  id: string;
  userId: string;
  artistId: string;
  price: Decimal;
  amount: number;
  type: 'BUY' | 'SELL';
  timestamp: Date;
  status: 'PENDING' | 'FILLED' | 'PARTIALLY_FILLED' | 'CANCELLED';
}

export interface Trade {
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  artistId: string;
  price: Decimal;
  amount: number;
  timestamp: Date;
}

class PriceLevel {
  private orders: Order[] = [];

  constructor(public readonly price: Decimal) {}

  addOrder(order: Order): void {
    this.orders.push(order);
    // Sort by timestamp (price-time priority)
    this.orders.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  removeOrder(orderId: string): Order | undefined {
    const index = this.orders.findIndex(order => order.id === orderId);
    if (index !== -1) {
      return this.orders.splice(index, 1)[0];
    }
    return undefined;
  }

  getOrders(): Order[] {
    return [...this.orders];
  }

  getTotalVolume(): number {
    return this.orders.reduce((sum, order) => sum + order.amount, 0);
  }

  isEmpty(): boolean {
    return this.orders.length === 0;
  }
}

export class OrderBook {
  private buyLevels: Map<string, PriceLevel> = new Map();
  private sellLevels: Map<string, PriceLevel> = new Map();
  private orders: Map<string, Order> = new Map();

  constructor(public readonly artistId: string) {}

  addOrder(order: Order): void {
    const levels = order.type === 'BUY' ? this.buyLevels : this.sellLevels;
    const priceKey = order.price.toString();
    
    if (!levels.has(priceKey)) {
      levels.set(priceKey, new PriceLevel(order.price));
    }
    
    levels.get(priceKey)!.addOrder(order);
    this.orders.set(order.id, order);
  }

  removeOrder(orderId: string): Order | undefined {
    const order = this.orders.get(orderId);
    if (!order) return undefined;

    const levels = order.type === 'BUY' ? this.buyLevels : this.sellLevels;
    const priceKey = order.price.toString();
    const priceLevel = levels.get(priceKey);
    
    if (priceLevel) {
      const removedOrder = priceLevel.removeOrder(orderId);
      if (priceLevel.isEmpty()) {
        levels.delete(priceKey);
      }
      this.orders.delete(orderId);
      return removedOrder;
    }
    
    return undefined;
  }

  getBestBid(): { price: Decimal; volume: number } | undefined {
    const prices = Array.from(this.buyLevels.values())
      .sort((a, b) => b.price.comparedTo(a.price));
    
    if (prices.length === 0) return undefined;
    
    const bestLevel = prices[0];
    return {
      price: bestLevel.price,
      volume: bestLevel.getTotalVolume()
    };
  }

  getBestAsk(): { price: Decimal; volume: number } | undefined {
    const prices = Array.from(this.sellLevels.values())
      .sort((a, b) => a.price.comparedTo(b.price));
    
    if (prices.length === 0) return undefined;
    
    const bestLevel = prices[0];
    return {
      price: bestLevel.price,
      volume: bestLevel.getTotalVolume()
    };
  }

  getOrderBookSnapshot(depth: number = 10): {
    bids: Array<{ price: Decimal; volume: number }>;
    asks: Array<{ price: Decimal; volume: number }>;
  } {
    const bids = Array.from(this.buyLevels.values())
      .sort((a, b) => b.price.comparedTo(a.price))
      .slice(0, depth)
      .map(level => ({
        price: level.price,
        volume: level.getTotalVolume()
      }));

    const asks = Array.from(this.sellLevels.values())
      .sort((a, b) => a.price.comparedTo(b.price))
      .slice(0, depth)
      .map(level => ({
        price: level.price,
        volume: level.getTotalVolume()
      }));

    return { bids, asks };
  }

  getOrder(orderId: string): Order | undefined {
    return this.orders.get(orderId);
  }

  updateOrder(orderId: string, newAmount: number): boolean {
    const order = this.orders.get(orderId);
    if (!order) return false;

    order.amount = newAmount;
    if (newAmount === 0) {
      this.removeOrder(orderId);
    }
    return true;
  }
} 