'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  artist: {
    name: string;
    symbol: string;
  };
  amount: number;
  price: number;
  total: number;
  timestamp: string;
}

interface PortfolioStats {
  totalValue: number;
  totalChange: number;
  bestPerformer: {
    name: string;
    symbol: string;
    change: number;
  };
  worstPerformer: {
    name: string;
    symbol: string;
    change: number;
  };
  totalTrades: number;
}

interface PerformanceData {
  timestamp: string;
  value: number;
  profit: number;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1w');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setTrades([
        {
          id: '1',
          type: 'buy',
          artist: { name: 'Taylor Swift', symbol: 'TSWIFT' },
          amount: 100,
          price: 150.25,
          total: 15025,
          timestamp: '2024-03-15T10:30:00Z'
        },
        {
          id: '2',
          type: 'sell',
          artist: { name: 'Drake', symbol: 'DRAKE' },
          amount: 50,
          price: 120.75,
          total: 6037.5,
          timestamp: '2024-03-14T15:45:00Z'
        }
      ]);

      setStats({
        totalValue: 25000,
        totalChange: 5.2,
        bestPerformer: {
          name: 'Taylor Swift',
          symbol: 'TSWIFT',
          change: 12.5
        },
        worstPerformer: {
          name: 'Drake',
          symbol: 'DRAKE',
          change: -3.2
        },
        totalTrades: 15
      });

      // Generate mock performance data
      const data: PerformanceData[] = [];
      const now = new Date();
      const points = 24; // 24 hours of data
      let baseValue = 25000;

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 3600000);
        const randomChange = (Math.random() - 0.5) * 0.02; // 2% max change
        const value = baseValue * (1 + randomChange);
        const profit = value - baseValue;

        data.push({
          timestamp: timestamp.toISOString(),
          value,
          profit
        });

        baseValue = value;
      }

      setPerformanceData(data);
      setLoading(false);
    }, 1000);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-teal-500/20">
          <p className="text-sm font-medium text-white">
            {new Date(label).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-300">
            Value: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-300">
            Profit: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
        <div className="grid gap-8">
          <Skeleton className="h-32 w-full bg-gray-800" />
          <Skeleton className="h-64 w-full bg-gray-800" />
          <Skeleton className="h-96 w-full bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-8 mb-8 border border-teal-500/20">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
            <span className="text-white text-4xl">
              {session?.user?.name?.[0] || 'U'}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{session?.user?.name}</h1>
            <p className="text-gray-400">{session?.user?.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Member since {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Portfolio Value</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats?.totalValue || 0)}</p>
          <p className={`text-sm ${stats?.totalChange >= 0 ? 'text-teal-400' : 'text-red-400'} mt-1`}>
            {stats?.totalChange >= 0 ? '+' : ''}{formatPercentage(stats?.totalChange || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Best Performer</h3>
          <p className="text-xl font-semibold text-white">{stats?.bestPerformer.name}</p>
          <p className="text-teal-400">
            {stats?.bestPerformer.change >= 0 ? '+' : ''}{formatPercentage(stats?.bestPerformer.change || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Worst Performer</h3>
          <p className="text-xl font-semibold text-white">{stats?.worstPerformer.name}</p>
          <p className="text-red-400">
            {stats?.worstPerformer.change >= 0 ? '+' : ''}{formatPercentage(stats?.worstPerformer.change || 0)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Trades</h3>
          <p className="text-2xl font-bold text-white">{stats?.totalTrades}</p>
          <p className="text-sm text-gray-400 mt-1">Lifetime trades</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-teal-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Portfolio Performance</h2>
          <div className="flex gap-2">
            {(['1d', '1w', '1m', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm ${
                  timeRange === range
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
                stroke="#9ca3af"
              />
              <YAxis
                stroke="#9ca3af"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#14b8a6"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
              <Area
                type="monotone"
                dataKey="profit"
                stroke="#0ea5e9"
                fillOpacity={1}
                fill="url(#colorProfit)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Trading History */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Trading History</h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600">
              All
            </button>
            <button className="px-3 py-1 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600">
              Buys
            </button>
            <button className="px-3 py-1 rounded-md text-sm bg-gray-700 text-gray-300 hover:bg-gray-600">
              Sells
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-700">
                <th className="pb-3 text-sm font-medium text-gray-400">Type</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Artist</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Amount</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Price</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Total</th>
                <th className="pb-3 text-sm font-medium text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-gray-700 last:border-0">
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      trade.type === 'buy'
                        ? 'bg-teal-500/20 text-teal-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-4">
                    <div>
                      <p className="font-medium text-white">{trade.artist.name}</p>
                      <p className="text-sm text-gray-400">{trade.artist.symbol}</p>
                    </div>
                  </td>
                  <td className="py-4 text-white">{trade.amount}</td>
                  <td className="py-4 text-white">{formatCurrency(trade.price)}</td>
                  <td className="py-4 text-white">{formatCurrency(trade.total)}</td>
                  <td className="py-4 text-gray-400">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 