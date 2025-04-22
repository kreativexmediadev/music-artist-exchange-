import { TwitterApi } from 'twitter-api-v2'

const twitterClient = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!)

export async function getTwitterMetrics(username: string) {
  try {
    const user = await twitterClient.v2.userByUsername(username, {
      'user.fields': ['public_metrics', 'description', 'created_at'],
    })

    if (!user.data) {
      throw new Error('User not found')
    }

    const tweets = await twitterClient.v2.userTimeline(user.data.id, {
      max_results: 100,
      'tweet.fields': ['public_metrics', 'created_at'],
    })

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTweets = tweets.data.data.filter(
      tweet => new Date(tweet.created_at!) > thirtyDaysAgo
    )

    const engagement = recentTweets.reduce(
      (acc, tweet) => {
        const metrics = tweet.public_metrics!
        return {
          likes: acc.likes + (metrics.like_count || 0),
          retweets: acc.retweets + (metrics.retweet_count || 0),
          replies: acc.replies + (metrics.reply_count || 0),
        }
      },
      { likes: 0, retweets: 0, replies: 0 }
    )

    const totalEngagements = engagement.likes + engagement.retweets + engagement.replies
    const engagementRate = totalEngagements / (recentTweets.length * user.data.public_metrics!.followers_count)

    return {
      followers: user.data.public_metrics!.followers_count,
      following: user.data.public_metrics!.following_count,
      tweets30d: recentTweets.length,
      engagement: {
        rate: engagementRate,
        likes: engagement.likes,
        retweets: engagement.retweets,
        replies: engagement.replies,
      },
    }
  } catch (error) {
    console.error('Error fetching Twitter metrics:', error)
    return null
  }
} 