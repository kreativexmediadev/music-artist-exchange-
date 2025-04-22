'use client';

import React from 'react';
import { SpotifyMetrics } from '@/types/spotify';

interface ArtistMetricsProps {
  artistId?: string;
  artistName?: string;
  metrics?: SpotifyMetrics;
}

export const ArtistMetrics: React.FC<ArtistMetricsProps> = ({ artistId, artistName, metrics }) => {
  // If we don't have metrics yet, show a placeholder
  if (!metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{artistName}</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Loading metrics...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{metrics.name}</h2>
        <p className="text-gray-600 dark:text-gray-300">
          {metrics.followers.toLocaleString()} followers • {metrics.popularity}% popularity
        </p>
        <div className="mt-2">
          {metrics.genres.map((genre) => (
            <span
              key={genre}
              className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full px-3 py-1 text-sm font-semibold mr-2 mb-2"
            >
              {genre}
            </span>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Top Tracks</h3>
        <div className="space-y-4">
          {metrics.topTracks.map((track) => (
            <div
              key={track.name}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <span className="text-gray-800 dark:text-gray-200">{track.name}</span>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {track.popularity}% popularity
                </span>
                {track.previewUrl && (
                  <audio controls className="h-8 w-48">
                    <source src={track.previewUrl} type="audio/mpeg" />
                  </audio>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Related Artists</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.relatedArtists.map((artist) => (
            <div
              key={artist.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center"
            >
              {artist.imageUrl && (
                <img
                  src={artist.imageUrl}
                  alt={artist.name}
                  className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                />
              )}
              <h4 className="font-medium text-gray-900 dark:text-white">{artist.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {artist.followers.toLocaleString()} followers
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 