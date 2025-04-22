import { getArtistMetrics, searchArtists } from '@/services/spotifyService'
import { getTwitterMetrics } from '@/services/twitterService'
// @ts-ignore
const NewsAPI = require('newsapi')

const newsapi = new NewsAPI(process.env.NEWS_API_KEY!)

async function testAPIs() {
  try {
    // Test Spotify API
    console.log('\nTesting Spotify API...')
    const artists = await searchArtists('Taylor Swift')
    if (artists.length > 0) {
      console.log('✅ Spotify Search successful')
      const metrics = await getArtistMetrics(artists[0].id)
      console.log('✅ Spotify Metrics successful')
      console.log('Sample data:', {
        name: metrics.name,
        followers: metrics.followers,
        topTracks: metrics.topTracks.length
      })
    }

    // Test Twitter API
    console.log('\nTesting Twitter API...')
    const twitterMetrics = await getTwitterMetrics('taylorswift13')
    if (twitterMetrics) {
      console.log('✅ Twitter API successful')
      console.log('Sample data:', {
        followers: twitterMetrics.followers,
        tweets30d: twitterMetrics.tweets30d
      })
    }

    // Test News API
    console.log('\nTesting News API...')
    const news = await newsapi.v2.everything({
      q: 'Taylor Swift',
      language: 'en',
      sortBy: 'relevancy',
      page: 1
    })
    if (news.articles.length > 0) {
      console.log('✅ News API successful')
      console.log('Sample data:', {
        totalResults: news.totalResults,
        articles: news.articles.length
      })
    }

  } catch (error) {
    console.error('Error testing APIs:', error)
  }
}

testAPIs() 