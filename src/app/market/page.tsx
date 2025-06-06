'use client';

import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
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
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface Artist {
  id: string;
  name: string;
  imageUrl: string | null;
  tokenSymbol: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  volumeChange24h: number;
  circulatingSupply: number;
  totalSupply: number;
  priceHistory: Array<{
    timestamp: string;
    price: number;
    volume: number;
  }>;
}

interface MarketStats {
  totalMarketCap: number;
  marketCapChange24h: number;
  totalVolume24h: number;
  volumeChange24h: number;
  totalArtists: number;
  activeTraders: number;
}

export default function MarketPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m' | '1y'>('1d');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [marketStats, setMarketStats] = useState<MarketStats>({
    totalMarketCap: 1500000000,
    marketCapChange24h: 5.2,
    totalVolume24h: 2500000,
    volumeChange24h: 15.3,
    totalArtists: 50,
    activeTraders: 1200
  });

  // Mock data generation for price history
  const generatePriceHistory = (basePrice: number, volatility: number) => {
    const history = [];
    const now = new Date();
    const points = 24; // 24 hours of data

    for (let i = points - 1; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 3600000);
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = basePrice * (1 + randomChange);
      const volume = Math.random() * 1000000;

      history.push({
        timestamp: timestamp.toISOString(),
        price,
        volume
      });
    }

    return history;
  };

  // Mock data for artists
  useEffect(() => {
    const mockArtists: Artist[] = [
      {
        id: '1',
        name: 'Taylor Swift',
        imageUrl: null,
        tokenSymbol: 'TSWIFT',
        currentPrice: 150.25,
        priceChange24h: 2.5,
        marketCap: 500000000,
        volume24h: 2500000,
        volumeChange24h: 15.3,
        circulatingSupply: 3000000,
        totalSupply: 5000000,
        priceHistory: generatePriceHistory(150.25, 0.02)
      },
      {
        id: '2',
        name: 'Drake',
        imageUrl: null,
        tokenSymbol: 'DRAKE',
        currentPrice: 120.75,
        priceChange24h: -1.2,
        marketCap: 400000000,
        volume24h: 1800000,
        volumeChange24h: -5.2,
        circulatingSupply: 3500000,
        totalSupply: 5000000,
        priceHistory: generatePriceHistory(120.75, 0.015)
      },
      {
        id: '3',
        name: 'Beyoncé',
        imageUrl: null,
        tokenSymbol: 'BEY',
        currentPrice: 180.50,
        priceChange24h: 3.8,
        marketCap: 600000000,
        volume24h: 3200000,
        volumeChange24h: 25.7,
        circulatingSupply: 2500000,
        totalSupply: 4000000,
        priceHistory: generatePriceHistory(180.50, 0.025)
      }
    ];

    setArtists(mockArtists);
    setLoading(false);
  }, []);

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setArtists(prevArtists => 
        prevArtists.map(artist => {
          const randomChange = (Math.random() - 0.5) * 0.002; // 0.2% max change
          const newPrice = artist.currentPrice * (1 + randomChange);
          const newPriceChange = artist.priceChange24h + randomChange;
          
          return {
            ...artist,
            currentPrice: newPrice,
            priceChange24h: newPriceChange,
            priceHistory: [
              ...artist.priceHistory.slice(1),
              {
                timestamp: new Date().toISOString(),
                price: newPrice,
                volume: Math.random() * 1000000
              }
            ]
          };
        })
      );
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="text-sm font-medium text-gray-900">
            {new Date(label).toLocaleTimeString()}
          </p>
          <p className="text-sm text-gray-600">
            Price: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            Volume: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid gap-8">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Total Market Cap</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(marketStats.totalMarketCap)}</p>
          <p className={`text-sm ${marketStats.marketCapChange24h >= 0 ? 'text-teal-400' : 'text-red-400'} mt-1`}>
            {marketStats.marketCapChange24h >= 0 ? '+' : ''}{formatPercentage(marketStats.marketCapChange24h)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">24h Volume</h3>
          <p className="text-2xl font-bold text-white">{formatCurrency(marketStats.totalVolume24h)}</p>
          <p className={`text-sm ${marketStats.volumeChange24h >= 0 ? 'text-teal-400' : 'text-red-400'} mt-1`}>
            {marketStats.volumeChange24h >= 0 ? '+' : ''}{formatPercentage(marketStats.volumeChange24h)}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
          <h3 className="text-sm font-medium text-gray-400 mb-1">Active Traders</h3>
          <p className="text-2xl font-bold text-white">{marketStats.activeTraders.toLocaleString()}</p>
          <p className="text-sm text-gray-400 mt-1">Across {marketStats.totalArtists} artists</p>
        </div>
      </div>

      {/* Live Ticker */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8 overflow-hidden border border-teal-500/20">
        <h2 className="text-xl font-semibold mb-4 text-white">Live Market</h2>
        <div className="flex space-x-8 overflow-x-auto pb-4">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="flex items-center space-x-4 min-w-[200px]"
              onClick={() => setSelectedArtist(artist)}
            >
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-gray-300 text-lg">{artist.name[0]}</span>
              </div>
              <div>
                <p className="font-medium text-white">{artist.tokenSymbol}</p>
                <p className={`text-sm ${artist.priceChange24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                  {formatCurrency(artist.currentPrice)}
                  <span className="ml-2">
                    {artist.priceChange24h >= 0 ? '+' : ''}{formatPercentage(artist.priceChange24h)}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artist List and Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Artist List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
            <h2 className="text-xl font-semibold mb-4 text-white">All Artists</h2>
            <div className="space-y-4">
              {artists.map((artist) => (
                <div
                  key={artist.id}
                  className={`flex items-center justify-between p-4 border-b border-gray-700 last:border-0 cursor-pointer hover:bg-gray-700/50 transition-colors ${
                    selectedArtist?.id === artist.id ? 'bg-gray-700' : ''
                  }`}
                  onClick={() => setSelectedArtist(artist)}
                >
                  <div className="flex items-center gap-4">
                    {artist.imageUrl ? (
                      <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
                        <span className="text-gray-300 text-xl">{artist.name[0]}</span>
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{artist.name}</h3>
                      <p className="text-sm text-gray-400">{artist.tokenSymbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-white">{formatCurrency(artist.currentPrice)}</p>
                    <p className={`text-sm ${artist.priceChange24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                      {artist.priceChange24h >= 0 ? '+' : ''}{formatPercentage(artist.priceChange24h)}
                    </p>
                    <p className="text-sm text-gray-400">
                      Vol: {formatCurrency(artist.volume24h)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Artist Details */}
        <div className="space-y-8">
          {selectedArtist ? (
            <>
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
                <h2 className="text-xl font-semibold mb-4 text-white">{selectedArtist.name}</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Price</h3>
                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedArtist.currentPrice)}</p>
                    <p className={`text-sm ${selectedArtist.priceChange24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                      {selectedArtist.priceChange24h >= 0 ? '+' : ''}{formatPercentage(selectedArtist.priceChange24h)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Market Cap</h3>
                    <p className="text-xl font-semibold text-white">{formatCurrency(selectedArtist.marketCap)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">24h Volume</h3>
                    <p className="text-xl font-semibold text-white">{formatCurrency(selectedArtist.volume24h)}</p>
                    <p className={`text-sm ${selectedArtist.volumeChange24h >= 0 ? 'text-teal-400' : 'text-red-400'}`}>
                      {selectedArtist.volumeChange24h >= 0 ? '+' : ''}{formatPercentage(selectedArtist.volumeChange24h)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400">Supply</h3>
                    <p className="text-sm text-gray-300">
                      Circulating: {selectedArtist.circulatingSupply.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">
                      Total: {selectedArtist.totalSupply.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
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
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedArtist.priceHistory}>
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
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-teal-500/20">
                                <p className="text-sm font-medium text-white">
                                  {new Date(label).toLocaleTimeString()}
                                </p>
                                <p className="text-sm text-gray-300">
                                  Price: {formatCurrency(payload[0].value)}
                                </p>
                                <p className="text-sm text-gray-300">
                                  Volume: {formatCurrency(payload[1].value)}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
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

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
                <h2 className="text-xl font-semibold mb-4 text-white">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    href={`/trade/${selectedArtist.id}`}
                    className="block w-full px-4 py-2 text-center bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors"
                  >
                    Trade {selectedArtist.tokenSymbol}
                  </Link>
                  <Link
                    href={`/artist/${selectedArtist.id}`}
                    className="block w-full px-4 py-2 text-center bg-gray-700 text-gray-300 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    View Artist Profile
                  </Link>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-teal-500/20">
              <p className="text-gray-400 text-center">Select an artist to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 