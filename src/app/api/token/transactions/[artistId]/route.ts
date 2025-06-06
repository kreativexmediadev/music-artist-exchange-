import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: { artistId: string } }
) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get transactions for the artist
    const transactions = await prisma.tokenTransaction.findMany({
      where: {
        artistId: params.artistId,
        userId: session.user.id,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50, // Limit to last 50 transactions
    });

    return NextResponse.json({
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 