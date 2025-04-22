import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.trade.deleteMany();
  await prisma.order.deleteMany();
  await prisma.socialMetrics.deleteMany();
  await prisma.financialMetrics.deleteMany();
  await prisma.technicalMetrics.deleteMany();
  await prisma.artistMetrics.deleteMany();
  await prisma.artist.deleteMany();

  // Create sample artists
  const artists = [
    {
      name: 'Taylor Swift',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
      genre: 'Pop',
      tokenSymbol: 'SWIFT',
      currentPrice: 150.75,
      priceChange24h: 5.2,
      marketCap: 1500000000,
      verified: true,
    },
    {
      name: 'Drake',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',
      genre: 'Hip Hop',
      tokenSymbol: 'DRAKE',
      currentPrice: 120.50,
      priceChange24h: -2.1,
      marketCap: 1200000000,
      verified: true,
    },
    {
      name: 'Ed Sheeran',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42399ef0ba',
      genre: 'Pop',
      tokenSymbol: 'SHEER',
      currentPrice: 90.25,
      priceChange24h: 1.8,
      marketCap: 900000000,
      verified: true,
    },
    {
      name: 'Billie Eilish',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb7b9e5ae06cd6c5de3bbd3bf6',
      genre: 'Alternative',
      tokenSymbol: 'EILISH',
      currentPrice: 85.60,
      priceChange24h: 3.4,
      marketCap: 850000000,
      verified: true,
    },
    {
      name: 'The Weeknd',
      imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb214f3cf1cbe7139c1e26ffbb',
      genre: 'R&B',
      tokenSymbol: 'WKND',
      currentPrice: 110.30,
      priceChange24h: -1.5,
      marketCap: 1100000000,
      verified: true,
    },
  ];

  for (const artistData of artists) {
    const artist = await prisma.artist.create({
      data: artistData,
    });

    // Create metrics for each artist
    const metrics = await prisma.artistMetrics.create({
      data: {
        artistId: artist.id,
        social: {
          create: {
            monthlyListeners: Math.floor(Math.random() * 50000000) + 10000000,
            spotifyFollowers: Math.floor(Math.random() * 30000000) + 5000000,
            topTracks: JSON.stringify([
              { name: 'Top Track 1', streams: '1.2M' },
              { name: 'Top Track 2', streams: '900K' },
              { name: 'Top Track 3', streams: '750K' },
            ]),
            instagramFollowers: Math.floor(Math.random() * 100000000) + 10000000,
            instagramEngagement: Math.random() * 5 + 1,
            instagramPosts30d: Math.floor(Math.random() * 30) + 5,
            twitterFollowers: Math.floor(Math.random() * 50000000) + 5000000,
            twitterEngagement: Math.random() * 3 + 0.5,
            twitterPosts30d: Math.floor(Math.random() * 100) + 20,
          },
        },
        financial: {
          create: {
            revenueStreams: JSON.stringify([
              { source: 'Streaming', percentage: 45 },
              { source: 'Tours', percentage: 30 },
              { source: 'Merchandise', percentage: 15 },
              { source: 'Other', percentage: 10 },
            ]),
            quarterlyRevenue: JSON.stringify([
              { quarter: 'Q1 2023', amount: Math.floor(Math.random() * 10000000) + 5000000 },
              { quarter: 'Q2 2023', amount: Math.floor(Math.random() * 10000000) + 5000000 },
              { quarter: 'Q3 2023', amount: Math.floor(Math.random() * 10000000) + 5000000 },
              { quarter: 'Q4 2023', amount: Math.floor(Math.random() * 10000000) + 5000000 },
            ]),
          },
        },
        technical: {
          create: {
            rsi: Math.random() * 60 + 20,
            macd: Math.random() * 20 - 10,
            movingAverage50d: artistData.currentPrice * (1 + (Math.random() * 0.2 - 0.1)),
            movingAverage200d: artistData.currentPrice * (1 + (Math.random() * 0.4 - 0.2)),
            sentimentOverall: ['bullish', 'neutral', 'bearish'][Math.floor(Math.random() * 3)],
            sentimentScore: Math.floor(Math.random() * 100),
            newsCount30d: Math.floor(Math.random() * 1000) + 100,
            socialMentions30d: Math.floor(Math.random() * 100000) + 10000,
          },
        },
      },
    });

    console.log(`Created artist ${artist.name} with metrics`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 