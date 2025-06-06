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

    // Get user's portfolio history
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

    // Get historical price data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const priceHistory = await prisma.priceHistory.findMany({
      where: {
        artistId: {
          in: user.portfolio.map((holding) => holding.artistId),
        },
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Calculate portfolio value for each day
    const portfolioHistory = priceHistory.reduce((acc, price) => {
      const holding = user.portfolio.find((h) => h.artistId === price.artistId);
      if (!holding) return acc;

      const existingDay = acc.find(
        (day) => day.timestamp === price.timestamp.toISOString()
      );

      if (existingDay) {
        existingDay.value += holding.amount * price.price;
      } else {
        acc.push({
          timestamp: price.timestamp.toISOString(),
          value: holding.amount * price.price,
        });
      }

      return acc;
    }, [] as { timestamp: string; value: number }[]);

    // Sort by timestamp
    portfolioHistory.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json(portfolioHistory);
  } catch (error) {
    console.error('Error fetching portfolio history:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 