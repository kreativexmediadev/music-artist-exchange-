import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's portfolio with artist details
    const portfolio = await prisma.portfolio.findMany({
      where: {
        userId: session.user.id,
        amount: {
          gt: 0, // Only include artists with tokens
        },
      },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            image: true,
            tokenSupply: true,
            tokensSold: true,
          },
        },
      },
      orderBy: {
        amount: 'desc', // Sort by amount of tokens owned
      },
    });

    // Transform the data to match the frontend interface
    const formattedPortfolio = portfolio.map(item => ({
      artist: item.artist,
      amount: item.amount,
    }));

    return NextResponse.json({
      portfolio: formattedPortfolio,
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 