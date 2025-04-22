import SpotifyWebApi from 'spotify-web-api-node'

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
  private tokenExpirationTime: number = 0

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

  /**
   * Ensure we have a valid access token
   */
  private async ensureAccessToken(): Promise<void> {
    const now = Date.now()
    if (!this.accessToken || now >= this.tokenExpirationTime) {
      try {
        const data = await spotifyApi.clientCredentialsGrant()
        this.accessToken = data.body.access_token
        this.tokenExpirationTime = now + data.body.expires_in * 1000
        spotifyApi.setAccessToken(this.accessToken)
        console.log('Successfully obtained Spotify access token')
      } catch (error) {
        console.error('Failed to obtain Spotify access token:', error)
        throw new Error('Failed to authenticate with Spotify API')
      }
    }
  }

  /**
   * Get detailed artist information from Spotify
   * @param spotifyId - Spotify artist ID
   */
  public async getArtist(spotifyId: string) {
    await this.ensureAccessToken()
    
    try {
      // Get artist data
      const artistData = await spotifyApi.getArtist(spotifyId)
      
      // Get additional data in parallel
      const [topTracks, relatedArtists, albums] = await Promise.all([
        spotifyApi.getArtistTopTracks(spotifyId, 'US'),
        spotifyApi.getArtistRelatedArtists(spotifyId),
        spotifyApi.getArtistAlbums(spotifyId, { limit: 50 })
      ])

      // Calculate total monthly listeners from top tracks
      const monthlyListeners = topTracks.body.tracks.reduce(
        (sum, track) => sum + (track.popularity * 100000), // Rough estimate based on popularity
        0
      )

      return {
        id: artistData.body.id,
        name: artistData.body.name,
        imageUrl: artistData.body.images[0]?.url,
        genres: artistData.body.genres,
        popularity: artistData.body.popularity,
        followers: artistData.body.followers.total,
        monthlyListeners,
        externalUrls: artistData.body.external_urls,
        href: artistData.body.href,
        uri: artistData.body.uri,
        topTracks: topTracks.body.tracks.map(track => ({
          id: track.id,
          name: track.name,
          popularity: track.popularity,
          previewUrl: track.preview_url,
          albumArt: track.album.images[0]?.url,
          releaseDate: track.album.release_date,
          externalUrls: track.external_urls,
          uri: track.uri,
        })),
        relatedArtists: relatedArtists.body.artists.map(artist => ({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.images[0]?.url,
          genres: artist.genres,
          popularity: artist.popularity,
          externalUrls: artist.external_urls,
          uri: artist.uri,
        })),
        albums: albums.body.items.map(album => ({
          id: album.id,
          name: album.name,
          imageUrl: album.images[0]?.url,
          releaseDate: album.release_date,
          totalTracks: album.total_tracks,
          type: album.album_type,
          externalUrls: album.external_urls,
          uri: album.uri,
        })),
      }
    } catch (error) {
      console.error('Error fetching artist data from Spotify:', error)
      throw error
    }
  }

  /**
   * Search for artists on Spotify
   * @param query - Search query
   */
  public async searchArtists(query: string) {
    await this.ensureAccessToken()
    
    try {
      const result = await spotifyApi.searchArtists(query)
      return result.body.artists?.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url,
        genres: artist.genres,
        popularity: artist.popularity,
        followers: artist.followers.total,
        externalUrls: artist.external_urls,
        uri: artist.uri,
      })) || []
    } catch (error) {
      console.error('Error searching artists on Spotify:', error)
      throw error
    }
  }

  /**
   * Get artist's latest album
   * @param spotifyId - Spotify artist ID
   */
  public async getLatestAlbum(spotifyId: string) {
    await this.ensureAccessToken()
    
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
    await this.ensureAccessToken()
    // Note: Spotify API doesn't directly provide events data
    // This is a placeholder for future implementation
    // Could be integrated with Songkick, Bandsintown, or similar APIs
    return []
  }
} 