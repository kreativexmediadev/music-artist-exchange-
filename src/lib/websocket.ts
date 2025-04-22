import { Server as WebSocketServer } from 'ws';
import { Server as HttpServer } from 'http';
import { NextApiResponse } from 'next';
import { prisma } from './prisma';
import { Decimal } from '@prisma/client/runtime/library';

interface WebSocketClient extends WebSocket {
  userId?: string;
  subscriptions?: Set<string>;
}

interface PriceUpdate {
  artistId: string;
  price: number;
  change24h: number;
  timestamp: number;
}

interface OrderUpdate {
  type: 'NEW' | 'MATCHED' | 'CANCELLED';
  orderId: string;
  artistId: string;
  price: number;
  amount: number;
  orderType: 'BUY' | 'SELL';
}

interface OrderBookLevel {
  price: Decimal;
  volume: number;
}

interface OrderBookUpdate {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

type WebSocketMessage = {
  type: 'PRICE_UPDATE';
  data: PriceUpdate;
} | {
  type: 'ORDER_UPDATE';
  data: OrderUpdate;
} | {
  type: 'ORDER_BOOK_UPDATE';
  data: OrderBookUpdate;
} | {
  type: 'USER_UPDATE';
  data: any;
};

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocketClient> = new Set();

  constructor(server: HttpServer) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketServer();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient) => {
      this.clients.add(ws);
      ws.subscriptions = new Set();

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          await this.handleMessage(ws, data);
        } catch (error) {
          console.error('Error handling message:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
      });

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'HEARTBEAT' }));
        } else {
          clearInterval(heartbeat);
        }
      }, 30000);
    });
  }

  private async handleMessage(ws: WebSocketClient, data: any) {
    switch (data.type) {
      case 'SUBSCRIBE_ARTIST':
        if (data.artistId) {
          ws.subscriptions?.add(data.artistId);
          // Send initial data
          const artist = await prisma.artist.findUnique({
            where: { id: data.artistId },
            include: { metrics: true },
          });
          if (artist) {
            ws.send(JSON.stringify({
              type: 'PRICE_UPDATE',
              data: {
                artistId: artist.id,
                price: artist.currentPrice,
                change24h: artist.priceChange24h,
                timestamp: Date.now(),
              },
            }));
          }
        }
        break;

      case 'UNSUBSCRIBE_ARTIST':
        if (data.artistId) {
          ws.subscriptions?.delete(data.artistId);
        }
        break;

      case 'AUTH':
        if (data.userId) {
          ws.userId = data.userId;
        }
        break;

      case 'SUBSCRIBE_ORDER_BOOK':
        if (data.artistId) {
          ws.subscriptions?.add(`orderbook:${data.artistId}`);
        }
        break;

      case 'UNSUBSCRIBE_ORDER_BOOK':
        if (data.artistId) {
          ws.subscriptions?.delete(`orderbook:${data.artistId}`);
        }
        break;
    }
  }

  public broadcastPriceUpdate(update: PriceUpdate) {
    this.broadcast({
      type: 'PRICE_UPDATE',
      data: update,
    }, client => client.subscriptions?.has(update.artistId));
  }

  public broadcastOrderUpdate(update: OrderUpdate) {
    this.broadcast({
      type: 'ORDER_UPDATE',
      data: update,
    }, client => client.subscriptions?.has(update.artistId));
  }

  public broadcastToArtist(artistId: string, message: WebSocketMessage) {
    this.broadcast(message, client => 
      client.subscriptions?.has(artistId) || 
      client.subscriptions?.has(`orderbook:${artistId}`)
    );
  }

  public sendUserUpdate(userId: string, data: any) {
    this.broadcast({
      type: 'USER_UPDATE',
      data,
    }, client => client.userId === userId);
  }

  private broadcast(message: WebSocketMessage, filter: (client: WebSocketClient) => boolean) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === client.OPEN && filter(client)) {
        client.send(messageStr);
      }
    });
  }
} 