import { prisma } from '@/lib/prisma';
import { spotifyService } from './spotifyService';

interface ValuationMetrics {
  monthlyListeners: number;
  followers: number;
  popularity: number;
  engagementRate: number;
  marketDemand: number;
}

interface ValuationResult {
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  metrics: ValuationMetrics;
  timestamp: Date;
}

export class ValuationService {
  private static readonly BASE_VALUE = 1000; // Base value in USD
  private static readonly METRIC_WEIGHTS = {
    monthlyListeners: 0.4,
    followers: 0.2,
    popularity: 0.2,
    engagementRate: 0.1,
    marketDemand: 0.1,
  };

  static async calculateArtistValue(artistId: string): Promise<ValuationResult> {
    try {
      // Get artist data from Spotify
      const artistData = await spotifyService.getArtist(artistId);
      
      // Get historical data from database
      const historicalData = await prisma.artistValuation.findMany({
        where: { artistId },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      const previousValue = historicalData[0]?.value || this.BASE_VALUE;

      // Calculate metrics
      const metrics: ValuationMetrics = {
        monthlyListeners: artistData.monthlyListeners || 0,
        followers: artistData.followers || 0,
        popularity: artistData.popularity || 0,
        engagementRate: this.calculateEngagementRate(artistData),
        marketDemand: this.calculateMarketDemand(artistData),
      };

      // Calculate current value
      const currentValue = this.calculateValueFromMetrics(metrics);
      
      // Calculate change
      const change = currentValue - previousValue;
      const changePercentage = (change / previousValue) * 100;

      // Store new valuation
      await prisma.artistValuation.create({
        data: {
          artistId,
          value: currentValue,
          metrics: metrics,
          timestamp: new Date(),
        },
      });

      return {
        currentValue,
        previousValue,
        change,
        changePercentage,
        metrics,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('Error calculating artist value:', error);
      throw error;
    }
  }

  private static calculateEngagementRate(artistData: any): number {
    // This is a simplified calculation - you might want to adjust this based on your needs
    const streams = artistData.streams || 0;
    const followers = artistData.followers || 1;
    return (streams / followers) * 100;
  }

  private static calculateMarketDemand(artistData: any): number {
    // This could be based on various factors like search trends, social media mentions, etc.
    // For now, we'll use a simplified calculation based on popularity and followers
    return (artistData.popularity * (artistData.followers / 1000000)) / 100;
  }

  private static calculateValueFromMetrics(metrics: ValuationMetrics): number {
    const weightedSum = 
      metrics.monthlyListeners * this.METRIC_WEIGHTS.monthlyListeners +
      metrics.followers * this.METRIC_WEIGHTS.followers +
      metrics.popularity * this.METRIC_WEIGHTS.popularity +
      metrics.engagementRate * this.METRIC_WEIGHTS.engagementRate +
      metrics.marketDemand * this.METRIC_WEIGHTS.marketDemand;

    return this.BASE_VALUE * (1 + weightedSum / 100);
  }
} 