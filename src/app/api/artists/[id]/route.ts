import { prisma } from '@/lib/prisma'
import { spotifyService } from '@/services/spotifyService'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get artist from database
    const dbArtist = await prisma.artist.findUnique({
      where: { id },
      include: {
        orderbook: {
          include: {
            orders: {
              orderBy: {
                price: 'desc'
              }
            }
          }
        }
      }
    });

    if (!dbArtist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Get artist data from Spotify
    const spotifyArtist = await spotifyService.getArtist(dbArtist.spotifyId);

    if (!spotifyArtist) {
      return NextResponse.json(
        { error: 'Failed to fetch artist data from Spotify' },
        { status: 500 }
      );
    }

    // Combine database and Spotify data
    const artist = {
      ...dbArtist,
      ...spotifyArtist,
      monthlyListeners: spotifyArtist.monthlyListeners || 0,
      followers: spotifyArtist.followers || 0,
      popularity: spotifyArtist.popularity || 0,
      genres: spotifyArtist.genres || [],
      topTracks: spotifyArtist.topTracks || [],
      relatedArtists: spotifyArtist.relatedArtists || [],
      albums: spotifyArtist.albums || []
    };

    return NextResponse.json(artist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist data' },
      { status: 500 }
    );
  }
} 