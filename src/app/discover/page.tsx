'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Artist {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  totalSupply: number;
  circulatingSupply: number;
  description: string;
  genres: string[];
  monthlyListeners: number;
  socialMedia: {
    spotify: string;
    instagram: string;
    twitter: string;
  };
  priceHistory: {
    date: string;
    price: number;
    volume: number;
  }[];
  investorSentiment: {
    bullish: number;
    neutral: number;
    bearish: number;
  };
  recentNews: {
    title: string;
    source: string;
    date: string;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

export default function DiscoverPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1W');

  // Mock artist data
  const mockArtist: Artist = {
    id: '1',
    name: 'Taylor Swift',
    symbol: 'TSWIFT',
    currentPrice: 150.25,
    priceChange24h: 5.27,
    marketCap: 1500000000,
    volume24h: 25000000,
    totalSupply: 10000000,
    circulatingSupply: 7500000,
    description: 'Taylor Swift is an American singer-songwriter who has become one of the most successful and influential artists in the music industry. With multiple Grammy Awards and record-breaking album sales, she has established herself as a global superstar.',
    genres: ['Pop', 'Country', 'Folk'],
    monthlyListeners: 85000000,
    socialMedia: {
      spotify: 'https://open.spotify.com/artist/06HL4z0CvFAxyc27GXpf02',
      instagram: 'https://instagram.com/taylorswift',
      twitter: 'https://twitter.com/taylorswift13',
    },
    priceHistory: [
      { date: '2024-01-01', price: 142.50, volume: 15000000 },
      { date: '2024-01-02', price: 145.75, volume: 18000000 },
      { date: '2024-01-03', price: 148.25, volume: 22000000 },
      { date: '2024-01-04', price: 146.50, volume: 19000000 },
      { date: '2024-01-05', price: 149.75, volume: 21000000 },
      { date: '2024-01-06', price: 150.25, volume: 25000000 },
    ],
    investorSentiment: {
      bullish: 65,
      neutral: 25,
      bearish: 10,
    },
    recentNews: [
      {
        title: 'Taylor Swift Announces New Album Release',
        source: 'Billboard',
        date: '2024-01-05',
        sentiment: 'positive',
      },
      {
        title: 'Record-Breaking Tour Sales',
        source: 'Rolling Stone',
        date: '2024-01-03',
        sentiment: 'positive',
      },
      {
        title: 'New Partnership with Major Brand',
        source: 'Variety',
        date: '2024-01-01',
        sentiment: 'neutral',
      },
    ],
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSelectedArtist(mockArtist);
    setIsLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 p-4 rounded-lg border border-teal-500/20 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          <p className="text-white font-medium">
            Price: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-teal-400 font-medium">
            Volume: {formatCurrency(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Search Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
          <h1 className="text-2xl font-bold text-white mb-6">Discover Artists</h1>
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for an artist..."
              className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {isLoading ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20 animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-700 rounded"></div>
          </div>
        ) : selectedArtist ? (
          <>
            {/* Artist Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                {/* Price Chart */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {selectedArtist.name} ({selectedArtist.symbol})
                      </h2>
                      <p className="text-2xl font-bold text-white mt-2">
                        {formatCurrency(selectedArtist.currentPrice)}
                      </p>
                      <p
                        className={`text-sm font-medium ${
                          selectedArtist.priceChange24h >= 0
                            ? 'text-teal-400'
                            : 'text-red-400'
                        }`}
                      >
                        {selectedArtist.priceChange24h >= 0 ? '+' : ''}
                        {selectedArtist.priceChange24h.toFixed(2)}%
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['1D', '1W', '1M', '1Y'].map((period) => (
                        <button
                          key={period}
                          onClick={() => setTimeRange(period as any)}
                          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                            timeRange === period
                              ? 'bg-teal-500 text-white'
                              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={selectedArtist.priceHistory}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} />
                        <YAxis yAxisId="left" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickFormatter={formatCurrency} />
                        <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" tick={{ fill: '#9CA3AF' }} tickFormatter={formatCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="price"
                          name="Price"
                          stroke="#2DD4BF"
                          fillOpacity={1}
                          fill="url(#colorPrice)"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="volume"
                          name="Volume"
                          stroke="#60A5FA"
                          fillOpacity={1}
                          fill="url(#colorVolume)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* About Artist */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">About {selectedArtist.name}</h2>
                  <p className="text-gray-300 mb-4">{selectedArtist.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedArtist.genres.map((genre) => (
                      <span
                        key={genre}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Monthly Listeners</h3>
                      <p className="text-white font-medium">
                        {formatNumber(selectedArtist.monthlyListeners)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Social Media</h3>
                      <div className="flex gap-4 mt-2">
                        <a
                          href={selectedArtist.socialMedia.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300"
                        >
                          Spotify
                        </a>
                        <a
                          href={selectedArtist.socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300"
                        >
                          Instagram
                        </a>
                        <a
                          href={selectedArtist.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-400 hover:text-teal-300"
                        >
                          Twitter
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {/* Market Data */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">Market Data</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Market Cap</h3>
                      <p className="text-white font-medium">
                        {formatCurrency(selectedArtist.marketCap)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">24h Volume</h3>
                      <p className="text-white font-medium">
                        {formatCurrency(selectedArtist.volume24h)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Total Supply</h3>
                      <p className="text-white font-medium">
                        {formatNumber(selectedArtist.totalSupply)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Circulating Supply</h3>
                      <p className="text-white font-medium">
                        {formatNumber(selectedArtist.circulatingSupply)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Investor Sentiment */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">Investor Sentiment</h2>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-teal-400">Bullish</span>
                        <span className="text-sm font-medium text-white">
                          {selectedArtist.investorSentiment.bullish}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-2 bg-teal-500 rounded-full"
                          style={{ width: `${selectedArtist.investorSentiment.bullish}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-400">Neutral</span>
                        <span className="text-sm font-medium text-white">
                          {selectedArtist.investorSentiment.neutral}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-2 bg-gray-400 rounded-full"
                          style={{ width: `${selectedArtist.investorSentiment.neutral}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-red-400">Bearish</span>
                        <span className="text-sm font-medium text-white">
                          {selectedArtist.investorSentiment.bearish}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full">
                        <div
                          className="h-2 bg-red-500 rounded-full"
                          style={{ width: `${selectedArtist.investorSentiment.bearish}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent News */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">Recent News</h2>
                  <div className="space-y-4">
                    {selectedArtist.recentNews.map((news, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-700/30 rounded-lg"
                      >
                        <h3 className="text-white font-medium mb-2">{news.title}</h3>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">{news.source}</span>
                          <span
                            className={`font-medium ${
                              news.sentiment === 'positive'
                                ? 'text-teal-400'
                                : news.sentiment === 'negative'
                                ? 'text-red-400'
                                : 'text-gray-400'
                            }`}
                          >
                            {news.sentiment.charAt(0).toUpperCase() + news.sentiment.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{news.date}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border border-teal-500/20">
                  <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <button
                      onClick={() => router.push(`/trade?symbol=${selectedArtist.symbol}`)}
                      className="w-full px-4 py-2 bg-teal-500 text-white font-medium rounded-md hover:bg-teal-600 transition-colors"
                    >
                      Trade {selectedArtist.symbol}
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors">
                      Add to Watchlist
                    </button>
                    <button className="w-full px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-600 transition-colors">
                      View Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
} 