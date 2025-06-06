import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const artists = await prisma.artist.findMany({
      where: {
        verified: true
      },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        tokenSymbol: true,
        currentPrice: true,
        priceChange24h: true,
        marketCap: true
      },
      orderBy: {
        marketCap: 'desc'
      }
    });

    return NextResponse.json(artists);
  } catch (error) {
    console.error('Error fetching verified artists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verified artists' },
      { status: 500 }
    );
  }
} 