import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get all artists with their current prices and changes
    const artists = await prisma.artist.findMany({
      select: {
        id: true,
        name: true,
        symbol: true,
        currentPrice: true,
        priceChange24h: true,
        totalSupply: true,
      },
    });

    // Calculate market cap and volume
    const totalMarketCap = artists.reduce(
      (sum, artist) => sum + artist.currentPrice * artist.totalSupply,
      0
    );

    // Get recent trades for volume calculation
    const recentTrades = await prisma.trade.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: {
        amount: true,
        price: true,
      },
    });

    const totalVolume24h = recentTrades.reduce(
      (sum, trade) => sum + trade.amount * trade.price,
      0
    );

    // Calculate top gainers and losers
    const sortedArtists = [...artists].sort(
      (a, b) => b.priceChange24h - a.priceChange24h
    );

    const topGainers = sortedArtists
      .filter((artist) => artist.priceChange24h > 0)
      .slice(0, 5)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        symbol: artist.symbol,
        price: artist.currentPrice,
        change24h: artist.priceChange24h,
      }));

    const topLosers = sortedArtists
      .filter((artist) => artist.priceChange24h < 0)
      .slice(0, 5)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        symbol: artist.symbol,
        price: artist.currentPrice,
        change24h: artist.priceChange24h,
      }));

    return NextResponse.json({
      totalMarketCap,
      totalVolume24h,
      topGainers,
      topLosers,
    });
  } catch (error) {
    console.error('Error fetching market summary:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 