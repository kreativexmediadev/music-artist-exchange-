import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

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

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: await hash('password123', 12),
    },
  });

  // Create dummy artists
  const artists = [
    {
      name: 'Luna Nova',
      genre: 'Electronic',
      bio: 'Rising star in the electronic music scene, known for ethereal soundscapes and innovative beats.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&h=500&fit=crop',
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/luna-nova',
        instagram: 'https://instagram.com/luna-nova',
        twitter: 'https://twitter.com/luna-nova',
        youtube: 'https://youtube.com/luna-nova',
        website: 'https://luna-nova.com',
      },
      tokenSupply: 1000,
      tokensSold: 200,
    },
    {
      name: 'The Midnight Riders',
      genre: 'Rock',
      bio: 'High-energy rock band bringing back the classic sound with a modern twist.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/midnight-riders',
        instagram: 'https://instagram.com/midnight-riders',
        twitter: 'https://twitter.com/midnight-riders',
        youtube: 'https://youtube.com/midnight-riders',
        website: 'https://midnight-riders.com',
      },
      tokenSupply: 2000,
      tokensSold: 500,
    },
    {
      name: 'Jazz Collective',
      genre: 'Jazz',
      bio: 'Innovative jazz ensemble pushing the boundaries of traditional jazz music.',
      image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=500&h=500&fit=crop',
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/jazz-collective',
        instagram: 'https://instagram.com/jazz-collective',
        twitter: 'https://twitter.com/jazz-collective',
        youtube: 'https://youtube.com/jazz-collective',
        website: 'https://jazz-collective.com',
      },
      tokenSupply: 1500,
      tokensSold: 750,
    },
    {
      name: 'Hip Hop Visionaries',
      genre: 'Hip Hop',
      bio: 'Groundbreaking hip hop group known for their thought-provoking lyrics and innovative production.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/hip-hop-visionaries',
        instagram: 'https://instagram.com/hip-hop-visionaries',
        twitter: 'https://twitter.com/hip-hop-visionaries',
        youtube: 'https://youtube.com/hip-hop-visionaries',
        website: 'https://hip-hop-visionaries.com',
      },
      tokenSupply: 3000,
      tokensSold: 1200,
    },
    {
      name: 'Classical Harmony',
      genre: 'Classical',
      bio: 'Renowned classical ensemble bringing timeless compositions to modern audiences.',
      image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop',
      socialLinks: {
        spotify: 'https://open.spotify.com/artist/classical-harmony',
        instagram: 'https://instagram.com/classical-harmony',
        twitter: 'https://twitter.com/classical-harmony',
        youtube: 'https://youtube.com/classical-harmony',
        website: 'https://classical-harmony.com',
      },
      tokenSupply: 2500,
      tokensSold: 300,
    },
  ];

  // Create artists and their portfolios
  for (const artistData of artists) {
    const artist = await prisma.artist.create({
      data: artistData,
    });

    // Create portfolio entry for test user
    await prisma.portfolio.create({
      data: {
        userId: testUser.id,
        artistId: artist.id,
        amount: Math.floor(Math.random() * 100) + 50, // Random amount between 50-150
      },
    });

    // Create some token transactions
    const transactionAmounts = [20, 30, 50, 75, 100];
    for (const amount of transactionAmounts) {
      await prisma.tokenTransaction.create({
        data: {
          artistId: artist.id,
          userId: testUser.id,
          amount,
          priceAtPurchase: 1 + (Math.random() * 0.5), // Random price between $1-$1.50
          type: 'BUY',
          timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
        },
      });
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 