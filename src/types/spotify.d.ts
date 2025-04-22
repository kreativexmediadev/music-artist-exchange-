export interface SpotifyTrack {
  name: string;
  popularity: number;
  previewUrl: string | null;
  externalUrl: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  followers: number;
  genres: string[];
  imageUrl?: string;
}

export interface SpotifyMetrics {
  name: string;
  followers: number;
  popularity: number;
  genres: string[];
  topTracks: SpotifyTrack[];
  relatedArtists: SpotifyArtist[];
} 