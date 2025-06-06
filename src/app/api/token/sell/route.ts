import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTokenPrice } from '@/lib/tokenUtils';
import { z } from 'zod';

// Input validation schema
const sellTokenSchema = z.object({
  artistId: z.string(),
  amount: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate input
    const body = await req.json();
    const { artistId, amount } = sellTokenSchema.parse(body);

    // Get user's portfolio
    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId_artistId: {
          userId: session.user.id,
          artistId,
        },
      },
    });

    if (!portfolio || portfolio.amount < amount) {
      return NextResponse.json(
        { error: 'Insufficient tokens to sell' },
        { status: 400 }
      );
    }

    // Get artist
    const artist = await prisma.artist.findUnique({
      where: { id: artistId },
      select: {
        id: true,
        tokensSold: true,
        tokenSupply: true,
      },
    });

    if (!artist) {
      return NextResponse.json(
        { error: 'Artist not found' },
        { status: 404 }
      );
    }

    // Calculate price at sale
    const priceAtSale = getTokenPrice(artist);

    // Update portfolio, artist, and create transaction in a single transaction
    const [updatedPortfolio, updatedArtist, transaction] = await prisma.$transaction([
      // Update portfolio
      prisma.portfolio.update({
        where: {
          userId_artistId: {
            userId: session.user.id,
            artistId,
          },
        },
        data: {
          amount: {
            decrement: amount,
          },
        },
      }),
      // Update artist's tokens sold
      prisma.artist.update({
        where: { id: artistId },
        data: {
          tokensSold: {
            decrement: amount,
          },
        },
      }),
      // Create transaction record
      prisma.tokenTransaction.create({
        data: {
          artistId,
          userId: session.user.id,
          amount,
          priceAtPurchase: priceAtSale,
          type: 'SELL',
        },
      }),
    ]);

    // Get updated token price
    const newTokenPrice = getTokenPrice(updatedArtist);

    return NextResponse.json({
      success: true,
      portfolio: updatedPortfolio,
      artist: updatedArtist,
      transaction,
      newTokenPrice,
    });
  } catch (error) {
    console.error('Error selling tokens:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 