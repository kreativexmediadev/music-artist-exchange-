import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();

  if (!session?.user || session.user.id !== params.id) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const portfolio = await prisma.portfolio.findMany({
      where: { userId: params.id },
      include: {
        artist: {
          select: {
            id: true,
            name: true,
            imageUrl: true,
            tokenSymbol: true,
            currentPrice: true,
          },
        },
      },
    });

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
} 