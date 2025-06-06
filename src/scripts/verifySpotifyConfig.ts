import { spotifyService } from '@/services/spotifyService';

async function verifySpotifyConfig() {
  try {
    console.log('Verifying Spotify API configuration...');
    
    // Check if environment variables are set
    if (!process.env.SPOTIFY_CLIENT_ID) {
      throw new Error('SPOTIFY_CLIENT_ID is not set');
    }
    if (!process.env.SPOTIFY_CLIENT_SECRET) {
      throw new Error('SPOTIFY_CLIENT_SECRET is not set');
    }

    console.log('Environment variables are set correctly');
    
    // Try to get an access token
    await spotifyService.searchArtists('test');
    console.log('Successfully authenticated with Spotify API');
    
    console.log('Spotify API configuration is working correctly');
  } catch (error) {
    console.error('Error verifying Spotify configuration:', error);
    process.exit(1);
  }
}

verifySpotifyConfig(); 