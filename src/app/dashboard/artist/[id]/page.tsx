'use client';

import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { FiTrendingUp, FiTrendingDown, FiMusic, FiCalendar } from 'react-icons/fi';
import TradingPanel from '@/components/trading/TradingPanel';
import { SpotifyService } from '@/services/spotifyService';

/**
 * Represents a revenue stream for an artist
 * @interface RevenueStream
 * @property {string} source - The source of revenue (e.g., "Streaming", "Tours")
 * @property {number} percentage - The percentage of total revenue from this source
 */
interface RevenueStream {
  source: string;
  percentage: number;
}

/**
 * Represents all metrics associated with an artist
 * @interface ArtistMetrics
 * @property {Object} [social] - Social media and streaming platform metrics
 * @property {number} social.monthlyListeners - Number of monthly listeners on Spotify
 * @property {number} social.spotifyFollowers - Number of Spotify followers
 * @property {number} social.instagramEngagement - Instagram engagement rate as a percentage
 * @property {Object} [financial] - Financial performance metrics
 * @property {RevenueStream[]} financial.revenueStreams - Breakdown of revenue sources
 * @property {Object} [technical] - Technical trading indicators
 * @property {number} technical.rsi - Relative Strength Index value
 * @property {number} technical.macd - Moving Average Convergence Divergence value
 * @property {number} technical.movingAverage50d - 50-day Moving Average price
 */
interface ArtistMetrics {
  social?: {
    monthlyListeners: number;
    spotifyFollowers: number;
    instagramEngagement: number;
  };
  financial?: {
    revenueStreams: RevenueStream[];
  };
  technical?: {
    rsi: number;
    macd: number;
    movingAverage50d: number;
  };
}

/**
 * Represents an artist in the music trading platform
 * @interface Artist
 * @property {string} id - Unique identifier for the artist
 * @property {string} name - Artist's name
 * @property {string} [imageUrl] - URL to the artist's profile image
 * @property {string} genre - Primary music genre
 * @property {boolean} verified - Whether the artist is verified
 * @property {number} currentPrice - Current trading price
 * @property {number} priceChange24h - 24-hour price change percentage
 * @property {number} marketCap - Market capitalization in USD
 * @property {ArtistMetrics} [metrics] - Collection of artist metrics
 */
interface Artist {
  id: string;
  name: string;
  imageUrl?: string;
  genre: string;
  verified: boolean;
  currentPrice: number;
  priceChange24h: number;
  marketCap: number;
  metrics?: ArtistMetrics;
}

interface SpotifyTrack {
  id: string;
  name: string;
  popularity: number;
  previewUrl: string | null;
  albumArt: string;
  releaseDate: string;
}

interface SpotifyAlbum {
  id: string;
  name: string;
  imageUrl: string;
  releaseDate: string;
  totalTracks: number;
  type: string;
}

interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl: string;
  genres: string[];
}

interface ArtistSpotifyData {
  id: string;
  name: string;
  imageUrl: string;
  genres: string[];
  popularity: number;
  followers: number;
  monthlyListeners: number;
  topTracks: SpotifyTrack[];
  relatedArtists: SpotifyArtist[];
  albums: SpotifyAlbum[];
}

interface ArtistDetailProps {
  params: {
    id: string;
  };
}

interface ArtistResponse extends Artist {
  spotify?: ArtistSpotifyData;
}

/**
 * Artist Detail Page Component
 * 
 * Displays comprehensive information about a specific artist, including:
 * - Basic profile information (name, image, verification status)
 * - Current trading metrics (price, 24h change, market cap)
 * - Trading panel for placing orders
 * - Social metrics (Spotify and Instagram statistics)
 * - Financial metrics (revenue streams)
 * - Technical indicators (RSI, MACD, Moving Averages)
 * 
 * @component
 * @param {ArtistDetailProps} props - Component props
 * @param {Object} props.params - URL parameters
 * @param {string} props.params.id - Artist ID from the URL
 * 
 * @example
 * // This component is typically rendered by Next.js routing at /dashboard/artist/[id]
 * <ArtistDetailPage params={{ id: "123" }} />
 */
export default function ArtistDetailPage({ params }: ArtistDetailProps) {
  // Fetch combined artist data
  const { data: artistData, isLoading, error } = useQuery<ArtistResponse>({
    queryKey: ['artist', params.id],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch artist');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-yellow border-t-transparent"></div>
      </div>
    );
  }

  if (error || !artistData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-400 text-lg">Error loading artist data</div>
      </div>
    );
  }

  const { spotify, ...artist } = artistData;

  // Debug logging for metrics data
  console.log('Metrics:', artist.metrics);
  console.log('Financial metrics:', artist.metrics?.financial);
  console.log('Revenue streams:', artist.metrics?.financial?.revenueStreams);

  /**
   * Renders the financial metrics section if revenue stream data is available
   * @returns {JSX.Element | null} The financial metrics component or null if data is unavailable
   */
  const renderFinancialMetrics = () => {
    if (!artist.metrics?.financial) {
      return null;
    }

    const { revenueStreams } = artist.metrics.financial;

    if (!revenueStreams || !Array.isArray(revenueStreams) || revenueStreams.length === 0) {
      return null;
    }

    return (
      <div className="bg-dark-card rounded-xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-white mb-4">Financial Metrics</h3>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-2">Revenue Streams</div>
            {revenueStreams.map((stream: RevenueStream) => (
              <div key={stream.source} className="flex justify-between items-center">
                <span className="text-white">{stream.source}</span>
                <span className="text-gray-400">{stream.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Artist Header */}
      <div className="bg-dark-card rounded-xl p-6 shadow-lg">
        <div className="flex items-start space-x-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden ring-2 ring-gray-700">
            {(spotify?.imageUrl || artist.imageUrl) ? (
              <Image
                src={spotify?.imageUrl || artist.imageUrl}
                alt={artist.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span className="text-4xl text-accent-yellow">
                  {artist.name[0]}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-white">{artist.name}</h1>
              {artist.verified && (
                <svg className="w-6 h-6 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="mt-2 text-gray-400">
              {spotify?.genres?.[0] || artist.genre}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-xl font-bold text-white">
                  ${artist.currentPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">24h Change</div>
                <div className={`text-xl font-bold flex items-center ${
                  artist.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {artist.priceChange24h >= 0 ? (
                    <FiTrendingUp className="mr-1" />
                  ) : (
                    <FiTrendingDown className="mr-1" />
                  )}
                  {artist.priceChange24h.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Market Cap</div>
                <div className="text-xl font-bold text-white">
                  ${(artist.marketCap / 1000000).toFixed(2)}M
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Panel */}
      <TradingPanel
        artistId={params.id}
        currentPrice={artist.currentPrice}
      />

      {/* Spotify Data */}
      {spotify && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Tracks */}
          <div className="bg-dark-card rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Top Tracks</h3>
            <div className="space-y-4">
              {spotify.topTracks.slice(0, 5).map((track) => (
                <div
                  key={track.id}
                  className="flex items-center space-x-4 p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <Image
                    src={track.albumArt}
                    alt={track.name}
                    width={48}
                    height={48}
                    className="rounded"
                  />
                  <div className="flex-1">
                    <div className="text-white font-medium">{track.name}</div>
                    <div className="text-sm text-gray-400">
                      Popularity: {track.popularity}%
                    </div>
                  </div>
                  {track.previewUrl && (
                    <audio
                      controls
                      className="w-32 h-8"
                      src={track.previewUrl}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Latest Releases */}
          <div className="bg-dark-card rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Latest Releases</h3>
            <div className="grid grid-cols-2 gap-4">
              {spotify.albums
                .filter(album => album.type === 'album')
                .slice(0, 4)
                .map((album) => (
                  <div
                    key={album.id}
                    className="bg-gray-800 rounded-lg p-4 space-y-2"
                  >
                    <Image
                      src={album.imageUrl}
                      alt={album.name}
                      width={200}
                      height={200}
                      className="w-full rounded-lg"
                    />
                    <div className="text-white font-medium truncate">
                      {album.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(album.releaseDate).toLocaleDateString()}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Related Artists */}
          <div className="bg-dark-card rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Similar Artists</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {spotify.relatedArtists.slice(0, 6).map((artist) => (
                <div
                  key={artist.id}
                  className="bg-gray-800 rounded-lg p-4 space-y-2"
                >
                  <Image
                    src={artist.imageUrl}
                    alt={artist.name}
                    width={100}
                    height={100}
                    className="w-full aspect-square rounded-lg object-cover"
                  />
                  <div className="text-white font-medium truncate">
                    {artist.name}
                  </div>
                  <div className="text-sm text-gray-400 truncate">
                    {artist.genres[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre Tags */}
          <div className="bg-dark-card rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Genres</h3>
            <div className="flex flex-wrap gap-2">
              {spotify.genres.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Artist Metrics */}
      {artist.metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Social Metrics */}
          {artist.metrics.social && (
            <div className="bg-dark-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Social Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">Monthly Listeners</div>
                  <div className="text-lg font-medium text-white">
                    {(spotify?.monthlyListeners || artist.metrics.social.monthlyListeners) / 1000000}M
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Spotify Followers</div>
                  <div className="text-lg font-medium text-white">
                    {(spotify?.followers || artist.metrics.social.spotifyFollowers) / 1000000}M
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Instagram Engagement</div>
                  <div className="text-lg font-medium text-white">
                    {artist.metrics.social.instagramEngagement.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Financial Metrics */}
          {renderFinancialMetrics()}

          {/* Technical Metrics */}
          {artist.metrics.technical && (
            <div className="bg-dark-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-4">Technical Metrics</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-400">RSI</div>
                  <div className="text-lg font-medium text-white">
                    {artist.metrics.technical.rsi.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">MACD</div>
                  <div className="text-lg font-medium text-white">
                    {artist.metrics.technical.macd.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">50-Day MA</div>
                  <div className="text-lg font-medium text-white">
                    ${artist.metrics.technical.movingAverage50d.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 