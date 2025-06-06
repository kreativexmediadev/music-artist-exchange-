import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's portfolio data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        portfolio: {
          include: {
            artist: true,
          },
        },
      },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Calculate portfolio value and changes
    const holdings = user.portfolio.map((holding) => ({
      id: holding.id,
      name: holding.artist.name,
      symbol: holding.artist.symbol,
      amount: holding.amount,
      value: holding.amount * holding.artist.currentPrice,
      change24h: holding.artist.priceChange24h,
    }));

    const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0);
    const dailyChange = holdings.reduce(
      (sum, holding) => sum + holding.value * (holding.change24h / 100),
      0
    );
    const dailyChangePercentage = (dailyChange / totalValue) * 100;

    return NextResponse.json({
      totalValue,
      dailyChange,
      dailyChangePercentage,
      holdings,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 