import { prisma } from '@/lib/prisma'
import { getArtistMetrics } from '@/services/spotifyService'
import { getTwitterMetrics } from '@/services/twitterService'
import { updateArtistMetrics } from '@/services/marketService'
import NewsAPI from 'newsapi'

const newsapi = new NewsAPI(process.env.NEWS_API_KEY!)

async function updateAllArtistMetrics() {
  try {
    // Get all artists
    const artists = await prisma.artist.findMany({
      include: {
        metrics: true,
      },
    })

    for (const artist of artists) {
      try {
        // Update Spotify metrics
        const spotifyMetrics = await getArtistMetrics(artist.spotifyId)
        
        // Update Twitter metrics
        const twitterMetrics = await getTwitterMetrics(artist.twitterUsername)
        
        // Get news articles and calculate sentiment
        const news = await newsapi.v2.everything({
          q: artist.name,
          language: 'en',
          sortBy: 'relevancy',
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

        // Simple sentiment analysis based on headlines
        const sentimentScore = calculateSentiment(news.articles)
        
        // Update market metrics
        const marketMetrics = await updateArtistMetrics(artist.id)

        // Update database
        await prisma.artist.update({
          where: { id: artist.id },
          data: {
            metrics: {
              update: {
                social: {
                  update: {
                    monthlyListeners: spotifyMetrics.followers,
                    spotifyFollowers: spotifyMetrics.followers,
                    topTracks: spotifyMetrics.topTracks,
                    instagramFollowers: twitterMetrics?.followers ?? 0,
                    instagramEngagement: twitterMetrics?.engagement.rate ?? 0,
                    instagramPosts30d: twitterMetrics?.tweets30d ?? 0,
                    twitterFollowers: twitterMetrics?.followers ?? 0,
                    twitterEngagement: twitterMetrics?.engagement.rate ?? 0,
                    twitterPosts30d: twitterMetrics?.tweets30d ?? 0,
                  },
                },
                technical: {
                  update: {
                    sentimentScore,
                    newsCount30d: news.articles.length,
                    socialMentions30d: calculateSocialMentions(news.articles),
                  },
                },
              },
            },
          },
        })

        console.log(`Updated metrics for ${artist.name}`)
      } catch (error) {
        console.error(`Error updating metrics for ${artist.name}:`, error)
      }
    }
  } catch (error) {
    console.error('Error in updateAllArtistMetrics:', error)
  }
}

function calculateSentiment(articles: any[]): number {
  const positiveWords = ['success', 'hit', 'award', 'achievement', 'popular', 'rise']
  const negativeWords = ['controversy', 'scandal', 'decline', 'fail', 'loss', 'bad']

  let score = 50 // Neutral starting point

  for (const article of articles) {
    const text = (article.title + ' ' + article.description).toLowerCase()
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length
    const negativeCount = negativeWords.filter(word => text.includes(word)).length
    
    score += positiveCount * 2
    score -= negativeCount * 2
  }

  return Math.min(Math.max(score, 0), 100) // Keep score between 0 and 100
}

function calculateSocialMentions(articles: any[]): number {
  return articles.reduce((count, article) => {
    const text = (article.title + ' ' + article.description).toLowerCase()
    const socialPlatforms = ['twitter', 'instagram', 'tiktok', 'facebook', 'youtube']
    return count + socialPlatforms.filter(platform => text.includes(platform)).length
  }, 0)
}

// Run the update every hour
setInterval(updateAllArtistMetrics, 60 * 60 * 1000)

// Initial run
updateAllArtistMetrics() 