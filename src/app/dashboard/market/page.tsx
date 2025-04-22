'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArtistMetrics } from '@/components/ArtistMetrics';
import { useSpotify } from '@/hooks/useSpotify';
import { SpotifyMetrics } from '@/types/spotify';

// Mock data - Replace with API data later
const mockMarketData = {
  marketStats: {
    totalVolume24h: 2500000,
    totalMarketCap: 150000000,
    activeTraders: 1250,
    totalArtists: 100,
  },
  trendingArtists: [
    {
      id: 1,
      name: 'Drake',
      price: 156.78,
      change24h: 5.43,
      marketCap: 15000000,
      volume24h: 500000,
    },
    {
      id: 2,
      name: 'Taylor Swift',
      price: 245.92,
      change24h: 8.21,
      marketCap: 25000000,
      volume24h: 750000,
    },
    {
      id: 3,
      name: 'The Weeknd',
      price: 178.45,
      change24h: -2.34,
      marketCap: 18000000,
      volume24h: 450000,
    },
  ],
  news: [
    {
      id: 1,
      title: 'Drake Announces New Album Release',
      summary: 'Impact on market value expected to be significant',
      date: '2024-03-15',
      source: 'Music Industry Weekly',
    },
    {
      id: 2,
      title: 'Taylor Swift Breaks Streaming Records',
      summary: 'New milestone achieved with latest release',
      date: '2024-03-14',
      source: 'Music Charts Daily',
    },
    {
      id: 3,
      title: 'Industry Analysis: Music NFTs on the Rise',
      summary: 'Digital ownership trending in music investment',
      date: '2024-03-13',
      source: 'Crypto Music News',
    },
  ],
};

export default function Page() {
  const { data: session } = useSession();
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedArtist, setSelectedArtist] = useState(mockMarketData.trendingArtists[0]);
  const [artistMetrics, setArtistMetrics] = useState<SpotifyMetrics | null>(null);
  const { setAccessToken, getArtistMetrics, isLoading } = useSpotify();

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
    }
  }, [session?.accessToken, setAccessToken]);

  useEffect(() => {
    const fetchMetrics = async () => {
      if (selectedArtist) {
        try {
          const metrics = await getArtistMetrics(selectedArtist.id.toString());
          setArtistMetrics(metrics);
        } catch (error) {
          console.error('Failed to fetch artist metrics:', error);
        }
      }
    };

    fetchMetrics();
  }, [selectedArtist, getArtistMetrics]);

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-400">24h Volume</h3>
          <p className="text-2xl font-bold text-white mt-2">
            ${mockMarketData.marketStats.totalVolume24h.toLocaleString()}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-400">Total Market Cap</h3>
          <p className="text-2xl font-bold text-white mt-2">
            ${mockMarketData.marketStats.totalMarketCap.toLocaleString()}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-400">Active Traders</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {mockMarketData.marketStats.activeTraders.toLocaleString()}
          </p>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-400">Listed Artists</h3>
          <p className="text-2xl font-bold text-white mt-2">
            {mockMarketData.marketStats.totalArtists}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trending Artists */}
        <div className="lg:col-span-2">
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Trending Artists</h2>
              <div className="flex space-x-2">
                {['24h', '7d', '30d'].map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSelectedTimeframe(timeframe)}
                    className={`px-3 py-1 rounded ${
                      selectedTimeframe === timeframe
                        ? 'bg-accent-yellow text-dark'
                        : 'bg-dark-card text-gray-300'
                    }`}
                  >
                    {timeframe}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-400">
                    <th className="pb-4">Artist</th>
                    <th className="pb-4">Price</th>
                    <th className="pb-4">24h Change</th>
                    <th className="pb-4">Market Cap</th>
                    <th className="pb-4">Volume</th>
                    <th className="pb-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {mockMarketData.trendingArtists.map((artist) => (
                    <tr
                      key={artist.id}
                      className={`border-t border-dark-card cursor-pointer hover:bg-dark-card/50 ${
                        selectedArtist.id === artist.id ? 'bg-dark-card' : ''
                      }`}
                      onClick={() => setSelectedArtist(artist)}
                    >
                      <td className="py-4 text-white">{artist.name}</td>
                      <td className="py-4 text-white">${artist.price.toFixed(2)}</td>
                      <td className={`py-4 ${
                        artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {artist.change24h >= 0 ? '+' : ''}{artist.change24h}%
                      </td>
                      <td className="py-4 text-white">${artist.marketCap.toLocaleString()}</td>
                      <td className="py-4 text-white">${artist.volume24h.toLocaleString()}</td>
                      <td className="py-4">
                        <button
                          onClick={() => window.location.href = `/dashboard/trade?artist=${artist.id}`}
                          className="px-3 py-1 rounded bg-accent-yellow text-dark text-sm hover:bg-accent-yellow/90"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* News Feed */}
        <div className="lg:col-span-1">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-white mb-6">Market News</h2>
            <div className="space-y-6">
              {mockMarketData.news.map((item) => (
                <div key={item.id} className="border-b border-dark-card pb-4 last:border-0">
                  <h3 className="text-white font-medium mb-2">{item.title}</h3>
                  <p className="text-gray-400 text-sm mb-2">{item.summary}</p>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{item.source}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Artist Metrics */}
      {selectedArtist && (
        <ArtistMetrics
          artistId={selectedArtist.id.toString()}
          artistName={selectedArtist.name}
          metrics={artistMetrics || undefined}
        />
      )}

      {/* FAQ Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Investment FAQ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-white font-medium mb-2">How are artist values determined?</h3>
            <p className="text-gray-400 text-sm">
              Artist values are calculated using proprietary algorithms that consider streaming numbers,
              social media engagement, concert revenues, and other key performance indicators.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">What affects artist token prices?</h3>
            <p className="text-gray-400 text-sm">
              Prices are influenced by market demand, new releases, touring schedules, streaming performance,
              and overall artist popularity metrics.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">How to start investing?</h3>
            <p className="text-gray-400 text-sm">
              Begin by creating an account, completing KYC verification, depositing funds, and researching
              artists before making your first investment.
            </p>
          </div>
          <div>
            <h3 className="text-white font-medium mb-2">What are the investment risks?</h3>
            <p className="text-gray-400 text-sm">
              Like any investment, artist tokens carry risks including market volatility, changes in artist
              popularity, and industry trends. Diversification is recommended.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 