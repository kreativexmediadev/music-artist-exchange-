import { prisma } from '@/lib/prisma';

async function updateTestArtists() {
  const artists = [
    {
      name: 'Drake',
      tokenSymbol: 'DRAKE',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',
      genre: 'Hip-Hop',
      currentPrice: 25.50,
      priceChange24h: 2.5,
      marketCap: 1000000,
      verified: true,
      metrics: {
        social: {
          monthlyListeners: 50000000,
          spotifyFollowers: 25000000,
          topTracks: [
            { name: 'God\'s Plan', streams: '2000000000' },
            { name: 'One Dance', streams: '1800000000' },
            { name: 'Hotline Bling', streams: '1500000000' }
          ],
          instagramFollowers: 120000000,
          instagramEngagement: 3.5,
          instagramPosts30d: 12,
          twitterFollowers: 40000000,
          twitterEngagement: 2.8,
          twitterPosts30d: 25
        },
        financial: {
          revenueStreams: [
            { source: 'Streaming', percentage: 40 },
            { source: 'Concerts', percentage: 35 },
            { source: 'Merchandise', percentage: 15 },
            { source: 'Brand Deals', percentage: 10 }
          ],
          quarterlyRevenue: [
            { quarter: 'Q1 2024', amount: 25000000 },
            { quarter: 'Q4 2023', amount: 22000000 },
            { quarter: 'Q3 2023', amount: 20000000 }
          ]
        },
        technical: {
          rsi: 65.5,
          macd: 1.2,
          movingAverage50d: 24.8,
          movingAverage200d: 22.5,
          sentimentOverall: 'Bullish',
          sentimentScore: 75,
          newsCount30d: 120,
          socialMentions30d: 500000
        }
      }
    },
    {
      name: 'Taylor Swift',
      tokenSymbol: 'TSWIFT',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7a2240723879a0e4a1f3a971',
      genre: 'Pop',
      currentPrice: 45.75,
      priceChange24h: -1.2,
      marketCap: 2000000,
      verified: true,
      metrics: {
        social: {
          monthlyListeners: 80000000,
          spotifyFollowers: 40000000,
          topTracks: [
            { name: 'Anti-Hero', streams: '1500000000' },
            { name: 'Cruel Summer', streams: '1200000000' },
            { name: 'Blank Space', streams: '1000000000' }
          ],
          instagramFollowers: 270000000,
          instagramEngagement: 4.2,
          instagramPosts30d: 8,
          twitterFollowers: 95000000,
          twitterEngagement: 3.5,
          twitterPosts30d: 15
        },
        financial: {
          revenueStreams: [
            { source: 'Streaming', percentage: 30 },
            { source: 'Concerts', percentage: 45 },
            { source: 'Merchandise', percentage: 20 },
            { source: 'Brand Deals', percentage: 5 }
          ],
          quarterlyRevenue: [
            { quarter: 'Q1 2024', amount: 35000000 },
            { quarter: 'Q4 2023', amount: 30000000 },
            { quarter: 'Q3 2023', amount: 28000000 }
          ]
        },
        technical: {
          rsi: 70.2,
          macd: 2.1,
          movingAverage50d: 44.5,
          movingAverage200d: 40.2,
          sentimentOverall: 'Very Bullish',
          sentimentScore: 85,
          newsCount30d: 180,
          socialMentions30d: 800000
        }
      }
    }
  ];

  for (const artistData of artists) {
    const { metrics, ...artist } = artistData;
    
    // First, find the existing artist
    const existingArtist = await prisma.artist.findUnique({
      where: { tokenSymbol: artist.tokenSymbol },
      include: { metrics: true }
    });

    if (!existingArtist) {
      console.log(`Artist ${artist.name} not found, skipping...`);
      continue;
    }

    // Update the artist
    const updatedArtist = await prisma.artist.update({
      where: { id: existingArtist.id },
      data: {
        ...artist,
        metrics: {
          update: {
            social: {
              update: metrics.social
            },
            financial: {
              update: metrics.financial
            },
            technical: {
              update: metrics.technical
            }
          }
        }
      }
    });

    console.log(`Updated artist: ${updatedArtist.name}`);
  }
}

updateTestArtists()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 