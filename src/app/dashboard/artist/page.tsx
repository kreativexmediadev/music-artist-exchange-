'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { artistService, type ArtistFilters } from '@/services/artistService';
import { FiTrendingUp, FiTrendingDown, FiSearch, FiFilter, FiRefreshCw } from 'react-icons/fi';

const SORT_OPTIONS = [
  { value: 'marketCap', label: 'Market Cap', field: 'marketCap' },
  { value: 'currentPrice', label: 'Price', field: 'currentPrice' },
  { value: 'priceChange24h', label: '24h Change', field: 'priceChange24h' },
  { value: 'monthlyListeners', label: 'Monthly Listeners', field: 'metrics.social.monthlyListeners' },
] as const;

type SortField = typeof SORT_OPTIONS[number]['value'];

export default function ArtistsPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Create filters object
  const filters: ArtistFilters = {
    search: searchQuery,
    genre: selectedGenre === 'all' ? undefined : selectedGenre,
    sortBy,
    sortDirection,
    page,
    pageSize,
  };

  // Fetch artists with React Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ['artists', filters],
    queryFn: () => artistService.getArtists(filters),
    keepPreviousData: true,
    retry: 1,
  });

  // Calculate total pages
  const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

  // Format number to millions
  const formatMillions = (value: number) => {
    return `${(value / 1000000).toFixed(1)}M`;
  };

  // Format price with 2 decimal places
  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-dark-card rounded-xl p-6 shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">Artist Market</h1>
              <button
                onClick={() => refetch()}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                disabled={isFetching}
              >
                <FiRefreshCw className={`w-5 h-5 ${isFetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search artists..."
                  className="pl-10 pr-4 py-2 w-full md:w-64 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-4 py-2 w-full md:w-48 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none appearance-none cursor-pointer transition-all"
                  value={selectedGenre}
                  onChange={(e) => {
                    setSelectedGenre(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="all">All Genres</option>
                  {data?.artists
                    .map(artist => artist.genre)
                    .filter((genre, index, self) => self.indexOf(genre) === index)
                    .sort()
                    .map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {data && (
              <>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Total Artists</div>
                  <div className="text-xl font-bold text-white">{data.total}</div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Total Market Cap</div>
                  <div className="text-xl font-bold text-white">
                    ${formatMillions(data.artists.reduce((sum, artist) => sum + artist.marketCap, 0))}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Avg. Price Change</div>
                  <div className={`text-xl font-bold ${
                    data.artists.reduce((sum, artist) => sum + artist.priceChange24h, 0) / data.artists.length >= 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}>
                    {formatPercentage(data.artists.reduce((sum, artist) => sum + artist.priceChange24h, 0) / data.artists.length)}
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400">Total Listeners</div>
                  <div className="text-xl font-bold text-white">
                    {formatMillions(data.artists.reduce((sum, artist) => sum + artist.monthlyListeners, 0))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sort Options */}
        <div className="bg-dark-card rounded-xl p-4 shadow-lg">
          <div className="flex flex-wrap gap-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  if (sortBy === option.value) {
                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                  } else {
                    setSortBy(option.value);
                    setSortDirection('desc');
                  }
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2 ${
                  sortBy === option.value
                    ? 'bg-accent-yellow text-dark font-medium shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{option.label}</span>
                {sortBy === option.value && (
                  <span className="ml-1">
                    {sortDirection === 'asc' ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-yellow border-t-transparent"></div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-dark-card rounded-xl p-8 text-center">
            <div className="text-red-400 mb-4 text-lg">
              {error instanceof Error ? error.message : 'An error occurred while fetching artists'}
            </div>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-accent-yellow text-dark rounded-lg hover:bg-accent-yellow/90 transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Artists Grid */}
        {data && data.artists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/dashboard/artist/${artist.id}`}
                className="group bg-dark-card hover:bg-gray-800 rounded-xl p-6 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-gray-700 group-hover:ring-accent-yellow transition-colors">
                      {artist.imageUrl ? (
                        <Image
                          src={artist.imageUrl}
                          alt={artist.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-2xl text-accent-yellow">
                            {artist.name[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center group-hover:text-accent-yellow transition-colors">
                        {artist.name}
                        {artist.verified && (
                          <svg className="w-4 h-4 ml-1 text-accent-yellow" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </h3>
                      <div className="text-sm text-gray-400">
                        ${artist.tokenSymbol} • {artist.genre}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-medium ${artist.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'} flex items-center`}>
                    {artist.priceChange24h >= 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : <FiTrendingDown className="w-4 h-4 mr-1" />}
                    {formatPercentage(artist.priceChange24h)}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Price</div>
                    <div className="text-white font-medium">
                      {formatPrice(artist.currentPrice)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Market Cap</div>
                    <div className="text-white font-medium">
                      ${formatMillions(artist.marketCap)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-sm text-gray-400">Monthly Listeners</div>
                    <div className="text-white font-medium">
                      {formatMillions(artist.monthlyListeners)}
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <button 
                      className="w-full px-4 py-2 bg-accent-yellow text-dark rounded-lg hover:bg-accent-yellow/90 transition-colors text-sm font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        // Trade functionality will be implemented later
                      }}
                    >
                      Trade
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : !isLoading && (
          <div className="bg-dark-card rounded-xl p-8 text-center text-gray-400">
            No artists found matching your criteria
          </div>
        )}

        {/* Pagination */}
        {data && totalPages > 1 && (
          <div className="bg-dark-card rounded-xl p-4 flex justify-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === 1
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Previous
            </button>
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                .map((p, i, arr) => (
                  <div key={p}>
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="text-gray-400 mx-2">...</span>
                    )}
                    <button
                      onClick={() => setPage(p)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === p
                          ? 'bg-accent-yellow text-dark font-medium'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      {p}
                    </button>
                  </div>
                ))}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-lg transition-colors ${
                page === totalPages
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 