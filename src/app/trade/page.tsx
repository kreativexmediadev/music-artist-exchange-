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

interface Artist {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  price: number;
  amount: number;
  total: number;
  timestamp: string;
}

interface PriceHistory {
  timestamp: string;
  price: number;
  volume: number;
}

export default function TradePage() {
  const { data: session } = useSession();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }>({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [priceHistory, setPriceHistory] = useState<PriceHistory[]>([]);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setArtist({
        id: '1',
        name: 'Taylor Swift',
        symbol: 'TSWIFT',
        currentPrice: 150.25,
        priceChange24h: 5.2,
        volume24h: 2500000,
        marketCap: 150000000
      });

      // Generate mock order book
      const bids: OrderBookEntry[] = [];
      const asks: OrderBookEntry[] = [];
      let currentPrice = 150.25;

      for (let i = 0; i < 10; i++) {
        const bidPrice = currentPrice * (1 - (i + 1) * 0.01);
        const askPrice = currentPrice * (1 + (i + 1) * 0.01);
        const amount = Math.random() * 1000;

        bids.push({
          price: bidPrice,
          amount,
          total: bidPrice * amount
        });

        asks.push({
          price: askPrice,
          amount,
          total: askPrice * amount
        });
      }

      setOrderBook({ bids, asks });

      // Generate mock recent trades
      const trades: Trade[] = [];
      for (let i = 0; i < 20; i++) {
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const price = currentPrice * (1 + (Math.random() - 0.5) * 0.02);
        const amount = Math.random() * 1000;
        const timestamp = new Date(Date.now() - i * 60000).toISOString();

        trades.push({
          id: i.toString(),
          type,
          price,
          amount,
          total: price * amount,
          timestamp
        });
      }

      setRecentTrades(trades);

      // Generate mock price history
      const history: PriceHistory[] = [];
      const now = new Date();
      const points = 24; // 24 hours of data
      let basePrice = currentPrice;

      for (let i = points - 1; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 3600000);
        const randomChange = (Math.random() - 0.5) * 0.02; // 2% max change
        const price = basePrice * (1 + randomChange);
        const volume = Math.random() * 1000000;

        history.push({
          timestamp: timestamp.toISOString(),
          price,
          volume
        });

        basePrice = price;
      }

      setPriceHistory(history);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle order submission
    console.log({
      type: orderType,
      side: orderSide,
      amount: parseFloat(amount),
      price: orderType === 'limit' ? parseFloat(price) : undefined
    });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-teal-500/20">
          <p className="text-sm font-medium text-white">
            {new Date(label).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-300">
            Price: {formatCurrency(data.price)}
          </p>
          <p className="text-sm text-gray-300">
            Volume: {formatCurrency(data.volume)}
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
      {/* Artist Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-teal-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <span className="text-white text-2xl">{artist?.name[0]}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{artist?.name}</h1>
              <p className="text-gray-400">{artist?.symbol}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatCurrency(artist?.currentPrice || 0)}</p>
            <p className={`text-sm ${artist?.priceChange24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
              {artist?.priceChange24h >= 0 ? '+' : ''}{formatPercentage(artist?.priceChange24h || 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Price Chart */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 mb-8 border border-teal-500/20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Price Chart</h2>
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
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
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
                    dataKey="price"
                    stroke="#14b8a6"
                    fillOpacity={1}
                    fill="url(#colorPrice)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Book */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Order Book</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Bids</h3>
                <div className="space-y-1">
                  {orderBook.bids.map((bid, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-teal-400">{formatCurrency(bid.price)}</span>
                      <span className="text-white">{bid.amount.toFixed(2)}</span>
                      <span className="text-gray-400">{formatCurrency(bid.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-2">Asks</h3>
                <div className="space-y-1">
                  {orderBook.asks.map((ask, index) => (
                    <div
                      key={index}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-red-400">{formatCurrency(ask.price)}</span>
                      <span className="text-white">{ask.amount.toFixed(2)}</span>
                      <span className="text-gray-400">{formatCurrency(ask.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Form and Recent Trades */}
        <div className="space-y-8">
          {/* Order Form */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Place Order</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderSide('buy')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    orderSide === 'buy'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setOrderSide('sell')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    orderSide === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('market')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    orderType === 'market'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('limit')}
                  className={`flex-1 px-4 py-2 rounded-md text-sm font-medium ${
                    orderType === 'limit'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Limit
                </button>
              </div>

              {orderType === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter price"
                    step="0.01"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter amount"
                  step="0.01"
                  required
                />
              </div>

              <button
                type="submit"
                className={`w-full px-4 py-2 rounded-md text-white font-medium ${
                  orderSide === 'buy'
                    ? 'bg-teal-500 hover:bg-teal-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {orderSide === 'buy' ? 'Buy' : 'Sell'} {artist?.symbol}
              </button>
            </form>
          </div>

          {/* Recent Trades */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg p-6 border border-teal-500/20">
            <h2 className="text-xl font-semibold mb-4 text-white">Recent Trades</h2>
            <div className="space-y-2">
              {recentTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      trade.type === 'buy' ? 'bg-teal-400' : 'bg-red-400'
                    }`} />
                    <span className={`text-sm ${
                      trade.type === 'buy' ? 'text-teal-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(trade.price)}
                    </span>
                  </div>
                  <span className="text-sm text-white">{trade.amount.toFixed(2)}</span>
                  <span className="text-sm text-gray-400">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 