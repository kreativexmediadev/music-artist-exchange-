'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArtistSearch } from '@/components/ArtistSearch';
import { ArtistMetrics } from '@/components/ArtistMetrics';
import { useSpotify } from '@/hooks/useSpotify';
import { SpotifyArtist, SpotifyMetrics } from '@/types/spotify';

export default function SpotifyPage() {
  const { data: session } = useSession();
  const [selectedArtist, setSelectedArtist] = useState<SpotifyArtist | null>(null);
  const { setAccessToken, getArtistMetrics, metrics, isLoading, error } = useSpotify();

  useEffect(() => {
    if (session?.accessToken) {
      setAccessToken(session.accessToken);
    }
  }, [session?.accessToken, setAccessToken]);

  const handleArtistSelect = async (artist: SpotifyArtist) => {
    setSelectedArtist(artist);
    await getArtistMetrics(artist.id);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Please sign in to access Spotify features
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        Artist Analytics
      </h1>

      <ArtistSearch onArtistSelect={handleArtistSelect} />

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded-lg">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {selectedArtist && metrics && <ArtistMetrics metrics={metrics} />}
    </div>
  );
} 