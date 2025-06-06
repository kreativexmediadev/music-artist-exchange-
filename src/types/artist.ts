export interface Artist {
  id: string;
  userId: string;
  name: string;
  bio: string;
  image: string;
  genre: string;
  socialLinks: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  tokenSupply: number;
  tokensSold: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateArtistInput {
  name: string;
  bio: string;
  image: string;
  genre: string;
  socialLinks: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
}

export interface UpdateArtistInput {
  name?: string;
  bio?: string;
  image?: string;
  genre?: string;
  socialLinks?: {
    spotify?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
  };
  tokenSupply?: number;
  tokensSold?: number;
}

export interface ArtistWithUser extends Artist {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

export interface ArtistWithStats extends Artist {
  totalHolders: number;
  totalVolume: number;
  averagePrice: number;
  priceChange24h: number;
} 