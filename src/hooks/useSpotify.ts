import { useState, useCallback } from 'react';
import { SpotifyService } from '@/services/spotify';
import { SpotifyArtist, SpotifyMetrics } from '@/types/spotify';

export const useSpotify = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<SpotifyMetrics | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifyArtist[]>([]);

  const spotifyService = SpotifyService.getInstance();

  const searchArtists = useCallback(async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await spotifyService.searchArtist(query);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getArtistMetrics = useCallback(async (artistId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const artistMetrics = await spotifyService.getArtistMetrics(artistId);
      setMetrics(artistMetrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching metrics');
      setMetrics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setAccessToken = useCallback((token: string) => {
    spotifyService.setAccessToken(token);
  }, []);

  return {
    isLoading,
    error,
    metrics,
    searchResults,
    searchArtists,
    getArtistMetrics,
    setAccessToken,
  };
}; 