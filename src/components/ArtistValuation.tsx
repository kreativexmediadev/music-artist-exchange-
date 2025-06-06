'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface ValuationMetrics {
  monthlyListeners: number;
  followers: number;
  popularity: number;
  engagementRate: number;
  marketDemand: number;
}

interface ValuationData {
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  metrics: ValuationMetrics;
  timestamp: Date;
}

interface ArtistValuationProps {
  artistId: string;
}

export function ArtistValuation({ artistId }: ArtistValuationProps) {
  const [valuation, setValuation] = useState<ValuationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io();

    // Initial fetch
    const fetchValuation = async () => {
      try {
        const response = await fetch(`/api/artists/${artistId}/valuation`);
        if (!response.ok) throw new Error('Failed to fetch valuation');
        const data = await response.json();
        setValuation(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch valuation');
      } finally {
        setLoading(false);
      }
    };

    fetchValuation();

    // Subscribe to real-time updates
    socket.emit('subscribe', artistId);
    socket.on(`valuation:${artistId}`, (data: ValuationData) => {
      setValuation(data);
    });

    return () => {
      socket.emit('unsubscribe', artistId);
      socket.disconnect();
    };
  }, [artistId]);

  if (loading) return <div>Loading valuation...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!valuation) return null;

  const isPositive = valuation.change >= 0;
  const changeColor = isPositive ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-4">Artist Valuation</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="text-3xl font-bold mb-2">
            {formatCurrency(valuation.currentValue)}
          </div>
          <div className={`text-lg ${changeColor}`}>
            {isPositive ? '↑' : '↓'} {formatCurrency(Math.abs(valuation.change))} 
            ({formatPercentage(valuation.changePercentage)})
          </div>
          <div className="text-sm text-gray-500 mt-2">
            Last updated: {new Date(valuation.timestamp).toLocaleString()}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3">Metrics</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Monthly Listeners:</span>
              <span>{valuation.metrics.monthlyListeners.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Followers:</span>
              <span>{valuation.metrics.followers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Popularity:</span>
              <span>{valuation.metrics.popularity}/100</span>
            </div>
            <div className="flex justify-between">
              <span>Engagement Rate:</span>
              <span>{formatPercentage(valuation.metrics.engagementRate)}</span>
            </div>
            <div className="flex justify-between">
              <span>Market Demand:</span>
              <span>{formatPercentage(valuation.metrics.marketDemand)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 