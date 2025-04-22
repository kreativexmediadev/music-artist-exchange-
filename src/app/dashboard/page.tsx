'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { UserRole } from '@/types/auth';

// Mock data - Replace with actual API calls
const mockPortfolioValue = {
  total: 25000,
  change: 1250,
  changePercent: 5.26,
};

const mockRecentTrades = [
  {
    id: 1,
    artist: 'Drake',
    type: 'BUY',
    amount: 100,
    price: 25.50,
    timestamp: '2024-03-15T10:30:00Z',
  },
  {
    id: 2,
    artist: 'Taylor Swift',
    type: 'SELL',
    amount: 50,
    price: 45.75,
    timestamp: '2024-03-15T09:15:00Z',
  },
];

const mockTopArtists = [
  {
    name: 'Drake',
    price: 25.50,
    change: 2.5,
  },
  {
    name: 'Taylor Swift',
    price: 45.75,
    change: -1.2,
  },
  {
    name: 'The Weeknd',
    price: 32.80,
    change: 0.8,
  },
];

export default function DashboardPage() {
  const { data: session } = useSession();
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">
          Welcome back, {session?.user?.firstName}
        </h1>
        <div className="flex space-x-2">
          {['1D', '1W', '1M', '1Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf as any)}
              className={`px-3 py-1 rounded ${
                timeframe === tf
                  ? 'bg-accent-yellow text-dark'
                  : 'bg-dark-card text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Portfolio Value</h2>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">
              ${mockPortfolioValue.total.toLocaleString()}
            </div>
            <div className={`text-sm ${mockPortfolioValue.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {mockPortfolioValue.change >= 0 ? '+' : ''}
              ${mockPortfolioValue.change.toLocaleString()} ({mockPortfolioValue.changePercent}%)
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-primary py-2">Buy Tokens</button>
            <button className="btn-secondary py-2">Sell Tokens</button>
          </div>
        </div>

        {/* Market Overview */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Market Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Market Cap</span>
              <span>$1.2B</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>24h Volume</span>
              <span>$150M</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Active Artists</span>
              <span>250</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Top Artists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Trades */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Recent Trades</h2>
          <div className="space-y-4">
            {mockRecentTrades.map((trade) => (
              <div key={trade.id} className="flex justify-between items-center p-3 bg-dark rounded">
                <div>
                  <div className="font-medium text-white">{trade.artist}</div>
                  <div className="text-sm text-gray-400">
                    {new Date(trade.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className={trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                    {trade.type} {trade.amount} @ ${trade.price}
                  </div>
                  <div className="text-sm text-gray-400">
                    ${(trade.amount * trade.price).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Artists */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Top Artists</h2>
          <div className="space-y-4">
            {mockTopArtists.map((artist) => (
              <div key={artist.name} className="flex justify-between items-center p-3 bg-dark rounded">
                <div className="font-medium text-white">{artist.name}</div>
                <div>
                  <div className="text-white">${artist.price}</div>
                  <div
                    className={`text-sm text-right ${
                      artist.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {artist.change >= 0 ? '+' : ''}
                    {artist.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Artist-specific content */}
      {session?.user?.role === UserRole.ARTIST && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Artist Stats</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-400">Token Price</div>
              <div className="text-2xl font-bold text-white">$32.50</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Market Cap</div>
              <div className="text-2xl font-bold text-white">$3.2M</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Holders</div>
              <div className="text-2xl font-bold text-white">1,250</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 