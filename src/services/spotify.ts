import { SpotifyArtist, SpotifyMetrics, SpotifyTrack } from '@/types/spotify';

export class SpotifyService {
  private static instance: SpotifyService;
  private accessToken: string | null = null;

  private constructor() {}

  public static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService();
    }
    return SpotifyService.instance;
  }

  public setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async fetchFromSpotify(endpoint: string) {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.statusText}`);
    }

    return response.json();
  }

  public async getArtistMetrics(artistId: string): Promise<SpotifyMetrics> {
    const [artist, topTracks, related] = await Promise.all([
      this.fetchFromSpotify(`/artists/${artistId}`),
      this.fetchFromSpotify(`/artists/${artistId}/top-tracks?market=US`),
      this.fetchFromSpotify(`/artists/${artistId}/related-artists`),
    ]);

    const formattedTracks: SpotifyTrack[] = topTracks.tracks.map((track: any) => ({
      name: track.name,
      popularity: track.popularity,
      previewUrl: track.preview_url,
      externalUrl: track.external_urls.spotify,
    }));

    const formattedRelated: SpotifyArtist[] = related.artists.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      popularity: artist.popularity,
      followers: artist.followers.total,
      genres: artist.genres,
      imageUrl: artist.images[0]?.url,
    }));

    return {
      name: artist.name,
      followers: artist.followers.total,
      popularity: artist.popularity,
      genres: artist.genres,
      topTracks: formattedTracks,
      relatedArtists: formattedRelated,
    };
  }

  public async searchArtist(query: string): Promise<SpotifyArtist[]> {
    const response = await this.fetchFromSpotify(`/search?q=${encodeURIComponent(query)}&type=artist`);
    
    return response.artists.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      popularity: artist.popularity,
      followers: artist.followers.total,
      genres: artist.genres,
      imageUrl: artist.images[0]?.url,
    }));
  }
} 