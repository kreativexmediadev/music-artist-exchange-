import { Server } from 'socket.io';
import { ValuationService } from './valuationService';

export class WebSocketService {
  private static io: Server | null = null;
  private static updateIntervals: Map<string, NodeJS.Timeout> = new Map();

  static initialize(io: Server) {
    this.io = io;
    
    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe', (artistId: string) => {
        console.log(`Client ${socket.id} subscribed to artist ${artistId}`);
        this.startUpdates(artistId);
      });

      socket.on('unsubscribe', (artistId: string) => {
        console.log(`Client ${socket.id} unsubscribed from artist ${artistId}`);
        this.stopUpdates(artistId);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        // Clean up any subscriptions
        this.updateIntervals.forEach((interval, artistId) => {
          this.stopUpdates(artistId);
        });
      });
    });
  }

  private static async startUpdates(artistId: string) {
    if (this.updateIntervals.has(artistId)) {
      return; // Already updating
    }

    const interval = setInterval(async () => {
      try {
        const valuation = await ValuationService.calculateArtistValue(artistId);
        this.io?.emit(`valuation:${artistId}`, valuation);
      } catch (error) {
        console.error(`Error updating valuation for artist ${artistId}:`, error);
      }
    }, 5000); // Update every 5 seconds

    this.updateIntervals.set(artistId, interval);
  }

  private static stopUpdates(artistId: string) {
    const interval = this.updateIntervals.get(artistId);
    if (interval) {
      clearInterval(interval);
      this.updateIntervals.delete(artistId);
    }
  }
} 