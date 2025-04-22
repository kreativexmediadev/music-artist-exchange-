import axios from 'axios';
import { QueryClient } from '@tanstack/react-query';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Initialize QueryClient for caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data is considered fresh for 5 minutes
      cacheTime: 30 * 60 * 1000, // Cache is kept for 30 minutes
      retry: 3, // Retry failed requests 3 times
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
    },
  },
});

// Types
export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genre: string;
  tokenSymbol: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  monthlyListeners: number;
  verified: boolean;
  socialMetrics: {
    spotify: {
      monthlyListeners: number;
      followers: number;
      topTracks: Array<{ name: string; streams: string }>;
    };
    instagram: {
      followers: number;
      engagement: number;
      posts30d: number;
    };
    twitter: {
      followers: number;
      engagement: number;
      tweets30d: number;
    };
  };
  financialMetrics: {
    revenueStreams: Array<{ source: string; percentage: number }>;
    quarterlyRevenue: Array<{ quarter: string; amount: number }>;
  };
  upcomingEvents: Array<{
    type: string;
    name: string;
    date: string;
    description: string;
  }>;
  analysis: {
    technicalIndicators: {
      rsi: number;
      macd: number;
      movingAverage50d: number;
      movingAverage200d: number;
    };
    marketSentiment: {
      overall: string;
      score: number;
      newsCount30d: number;
      socialMentions30d: number;
    };
  };
}

export interface ArtistListResponse {
  artists: Artist[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ArtistFilters {
  search?: string;
  genre?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Service
class ArtistService {
  private async handleRequest<T>(request: Promise<any>): Promise<T> {
    try {
      const response = await request;
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || error.message;
        const code = error.response?.data?.code;
        throw new ApiError(message, status, code);
      }
      throw error;
    }
  }

  async getArtists(filters: ArtistFilters = {}): Promise<ArtistListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    
    return this.handleRequest(
      axios.get(`${API_BASE_URL}/artists?${params.toString()}`)
    );
  }

  async getArtistById(id: string): Promise<Artist> {
    return this.handleRequest(
      axios.get(`${API_BASE_URL}/artists/${id}`)
    );
  }

  async getArtistPrice(id: string): Promise<{ price: number; change24h: number }> {
    return this.handleRequest(
      axios.get(`${API_BASE_URL}/artists/${id}/price`)
    );
  }

  async getArtistMetrics(id: string): Promise<{
    social: Artist['socialMetrics'];
    financial: Artist['financialMetrics'];
    analysis: Artist['analysis'];
  }> {
    return this.handleRequest(
      axios.get(`${API_BASE_URL}/artists/${id}/metrics`)
    );
  }

  // Trading functionality
  async placeBuyOrder(artistId: string, amount: number, price: number) {
    return this.handleRequest(
      axios.post(`${API_BASE_URL}/orders`, {
        artistId,
        type: 'BUY',
        amount,
        price,
      })
    );
  }

  async placeSellOrder(artistId: string, amount: number, price: number) {
    return this.handleRequest(
      axios.post(`${API_BASE_URL}/orders`, {
        artistId,
        type: 'SELL',
        amount,
        price,
      })
    );
  }

  async getOrderBook(artistId: string) {
    return this.handleRequest(
      axios.get(`${API_BASE_URL}/artists/${artistId}/orderbook`)
    );
  }

  async getTradeHistory(artistId: string) {
    return this.handleRequest(
      axios.get(`${API_BASE_URL}/artists/${artistId}/trades`)
    );
  }
}

export const artistService = new ArtistService(); 