import { getArtistMetrics, searchArtists } from '@/services/spotifyService'

async function testSpotifyAPI() {
  try {
    console.log('Testing Spotify API...')
    console.log('1. Searching for artist "Taylor Swift"...')
    
    const artists = await searchArtists('Taylor Swift')
    console.log(`Found ${artists.length} artists`)
    
    if (artists.length > 0) {
      const firstArtist = artists[0]
      console.log('\nFirst artist found:', {
        name: firstArtist.name,
        id: firstArtist.id,
        followers: firstArtist.followers,
        genres: firstArtist.genres,
      })

      console.log('\n2. Fetching detailed metrics for', firstArtist.name)
      const metrics = await getArtistMetrics(firstArtist.id)
      console.log('\nArtist metrics:', {
        name: metrics.name,
        followers: metrics.followers,
        popularity: metrics.popularity,
        topTracks: metrics.topTracks.map(track => ({
          name: track.name,
          popularity: track.popularity,
        })),
        relatedArtists: metrics.relatedArtists.slice(0, 3).map(artist => ({
          name: artist.name,
          popularity: artist.popularity,
        })),
      })
    }

  } catch (error) {
    console.error('Error testing Spotify API:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
  }
}

testSpotifyAPI() 