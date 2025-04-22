import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SpotifyService } from '@/services/spotifyService'
import { OrderStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Fetching artist with ID:', params.id);
    
    // Get artist data from database
    const artist = await prisma.artist.findUnique({
      where: { id: params.id },
      include: {
        metrics: true,
        orders: {
          where: { status: OrderStatus.OPEN },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!artist) {
      console.log('Artist not found in database');
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      )
    }

    console.log('Found artist in database:', artist.name);

    // Get Spotify data
    let spotifyData = null;
    try {
      const spotify = SpotifyService.getInstance()
      console.log('Searching Spotify for artist:', artist.name);
      
      // First try to find the artist by name
      const searchResults = await spotify.searchArtists(artist.name)
      
      if (searchResults.length > 0) {
        // Find the best match based on name similarity
        const bestMatch = searchResults.find(result => 
          result.name.toLowerCase() === artist.name.toLowerCase()
        ) || searchResults[0];
        
        console.log('Found artist on Spotify:', bestMatch.name);
        spotifyData = await spotify.getArtist(bestMatch.id)
      } else {
        console.log('No matching artist found on Spotify');
      }
    } catch (spotifyError) {
      console.error('Spotify API error:', spotifyError);
      // Continue with just the database data if Spotify fails
    }

    // Combine data
    const response = {
      ...artist,
      spotify: spotifyData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching artist data:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch artist data', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 