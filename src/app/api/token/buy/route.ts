import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getTokenPrice } from '@/lib/tokenUtils';
import { z } from 'zod';

// Input validation schema
const buyTokenSchema = z.object({
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
    const { artistId, amount } = buyTokenSchema.parse(body);

    // Get artist and validate token supply
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

    // Check if enough tokens are available
    if (artist.tokensSold + amount > artist.tokenSupply) {
      return NextResponse.json(
        { error: 'Not enough tokens available' },
        { status: 400 }
      );
    }

    // Calculate price at purchase
    const priceAtPurchase = getTokenPrice(artist);

    // Update artist and create transaction in a single transaction
    const [updatedArtist, transaction] = await prisma.$transaction([
      // Update artist's tokens sold
      prisma.artist.update({
        where: { id: artistId },
        data: {
          tokensSold: {
            increment: amount,
          },
        },
      }),
      // Create transaction record
      prisma.tokenTransaction.create({
        data: {
          artistId,
          userId: session.user.id,
          amount,
          priceAtPurchase,
        },
      }),
    ]);

    // Get updated token price
    const newTokenPrice = getTokenPrice(updatedArtist);

    return NextResponse.json({
      success: true,
      artist: updatedArtist,
      transaction,
      newTokenPrice,
    });
  } catch (error) {
    console.error('Error buying tokens:', error);
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