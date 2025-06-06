import SpotifyWebApi from 'spotify-web-api-node'
import { Artist } from '@prisma/client'

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
})

/**
 * Service class for handling Spotify API interactions
 */
export class SpotifyService {
  private static instance: SpotifyService
  private accessToken: string | null = null
  private tokenExpiration: number = 0

  private constructor() {}

  /**
   * Get singleton instance of SpotifyService
   */
  public static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService()
    }
    return SpotifyService.instance
  }

  private async ensureValidToken() {
    if (!this.accessToken || Date.now() >= this.tokenExpiration) {
      try {
        const data = await spotifyApi.clientCredentialsGrant()
        this.accessToken = data.body.access_token
        this.tokenExpiration = Date.now() + (data.body.expires_in * 1000)
        spotifyApi.setAccessToken(this.accessToken)
      } catch (error) {
        console.error('Error getting Spotify access token:', error)
        throw new Error('Failed to authenticate with Spotify')
      }
    }
  }

  /**
   * Get detailed artist information from Spotify
   * @param spotifyId - Spotify artist ID
   */
  public async getArtist(spotifyId: string) {
    try {
      await this.ensureValidToken()

      const [artist, topTracks, relatedArtists, albums] = await Promise.all([
        spotifyApi.getArtist(spotifyId),
        spotifyApi.getArtistTopTracks(spotifyId, 'US'),
        spotifyApi.getArtistRelatedArtists(spotifyId),
        spotifyApi.getArtistAlbums(spotifyId, { limit: 10 })
      ])

      // Calculate monthly listeners (this is an estimate since Spotify doesn't provide this directly)
      const monthlyListeners = Math.floor(artist.body.followers.total * 0.1)

      return {
        id: artist.body.id,
        name: artist.body.name,
        imageUrl: artist.body.images[0]?.url || null,
        followers: artist.body.followers.total,
        popularity: artist.body.popularity,
        genres: artist.body.genres,
        monthlyListeners,
        topTracks: topTracks.body.tracks.map(track => ({
          id: track.id,
          name: track.name,
          previewUrl: track.preview_url,
          durationMs: track.duration_ms,
          popularity: track.popularity
        })),
        relatedArtists: relatedArtists.body.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.images[0]?.url || null
        })),
        albums: albums.body.items.map(album => ({
          id: album.id,
          name: album.name,
          imageUrl: album.images[0]?.url || null,
          releaseDate: album.release_date,
          totalTracks: album.total_tracks
        }))
      }
    } catch (error) {
      console.error('Error fetching artist from Spotify:', error)
      throw error
    }
  }

  /**
   * Search for artists on Spotify
   * @param query - Search query
   */
  public async searchArtists(query: string) {
    try {
      await this.ensureValidToken()

      const response = await spotifyApi.searchArtists(query, { limit: 10 })
      return response.body.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url || null,
        followers: artist.followers.total,
        popularity: artist.popularity,
        genres: artist.genres
      }))
    } catch (error) {
      console.error('Error searching artists on Spotify:', error)
      throw error
    }
  }

  /**
   * Get artist by Spotify ID
   * @param spotifyId - Spotify artist ID
   */
  public async getArtistById(spotifyId: string) {
    await this.ensureValidToken()
    
    try {
      const artist = await spotifyApi.getArtist(spotifyId)
      return {
        id: artist.body.id,
        name: artist.body.name,
        imageUrl: artist.body.images[0]?.url,
        genres: artist.body.genres,
        popularity: artist.body.popularity,
        followers: artist.body.followers.total,
        externalUrls: artist.body.external_urls,
        uri: artist.body.uri,
      }
    } catch (error) {
      console.error('Error fetching artist by ID from Spotify:', error)
      if (error.statusCode === 404) {
        throw new Error('Artist not found on Spotify')
      }
      throw error
    }
  }

  /**
   * Get artist's latest album
   * @param spotifyId - Spotify artist ID
   */
  public async getLatestAlbum(spotifyId: string) {
    await this.ensureValidToken()
    
    try {
      const albums = await spotifyApi.getArtistAlbums(spotifyId, { limit: 1 })
      return albums.body.items[0] || null
    } catch (error) {
      console.error('Error fetching latest album from Spotify:', error)
      throw error
    }
  }

  /**
   * Get artist's upcoming events (through Spotify API if available)
   * @param spotifyId - Spotify artist ID
   */
  public async getArtistEvents(spotifyId: string) {
    await this.ensureValidToken()
    // Note: Spotify API doesn't directly provide events data
    // This is a placeholder for future implementation
    // Could be integrated with Songkick, Bandsintown, or similar APIs
    return []
  }
}

export const spotifyService = SpotifyService.getInstance() 