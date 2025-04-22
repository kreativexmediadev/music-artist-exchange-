import React, { useState, useCallback } from 'react';
import { useSpotify } from '@/hooks/useSpotify';
import { SpotifyArtist } from '@/types/spotify';

interface ArtistSearchProps {
  onArtistSelect: (artist: SpotifyArtist) => void;
}

export const ArtistSearch: React.FC<ArtistSearchProps> = ({ onArtistSelect }) => {
  const [query, setQuery] = useState('');
  const { searchArtists, searchResults, isLoading, error } = useSpotify();

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        await searchArtists(query);
      }
    },
    [query, searchArtists]
  );

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an artist..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchResults.map((artist) => (
          <div
            key={artist.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onArtistSelect(artist)}
          >
            {artist.imageUrl && (
              <img
                src={artist.imageUrl}
                alt={artist.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {artist.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              {artist.followers.toLocaleString()} followers
            </p>
            <div className="flex flex-wrap gap-2">
              {artist.genres.slice(0, 3).map((genre) => (
                <span
                  key={genre}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 