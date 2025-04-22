import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { MatchingEngine } from '@/lib/trading/MatchingEngine';
import { WebSocketManager } from '@/lib/websocket';
import { authOptions } from '@/lib/auth';

// Initialize WebSocket manager and matching engine
// Note: In a production environment, you'd want to manage these instances differently
let wsManager: WebSocketManager;
let matchingEngine: MatchingEngine;

// Schema for order creation
const createOrderSchema = z.object({
  artistId: z.string(),
  type: z.enum(['BUY', 'SELL']),
  price: z.number().positive(),
  amount: z.number().positive(),
  orderType: z.enum(['MARKET', 'LIMIT']).default('LIMIT'),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);

    // Check if user has sufficient balance for buy order
    if (validatedData.type === 'BUY') {
      const totalCost = validatedData.price * validatedData.amount;
      const userBalance = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { balance: true }
      });

      if (!userBalance || userBalance.balance.lessThan(totalCost)) {
        return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
      }
    }

    // Check if user has sufficient tokens for sell order
    if (validatedData.type === 'SELL') {
      const userPosition = await prisma.position.findUnique({
        where: {
          userId_artistId: {
            userId: session.user.id,
            artistId: validatedData.artistId
          }
        }
      });

      if (!userPosition || userPosition.amount < validatedData.amount) {
        return NextResponse.json({ error: 'Insufficient tokens' }, { status: 400 });
      }
    }

    // Create order in database
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        artistId: validatedData.artistId,
        type: validatedData.type,
        price: validatedData.price,
        amount: validatedData.amount,
        orderType: validatedData.orderType,
        status: 'PENDING'
      }
    });

    // Process order through matching engine
    if (!matchingEngine) {
      // Initialize matching engine if not exists
      // In production, this should be handled differently
      matchingEngine = new MatchingEngine(wsManager);
    }

    const processedOrder = await matchingEngine.processOrder({
      id: order.id,
      userId: order.userId,
      artistId: order.artistId,
      price: order.price,
      amount: order.amount,
      type: order.type,
      timestamp: order.createdAt,
      status: order.status
    });

    return NextResponse.json(processedOrder);
  } catch (error) {
    console.error('Error processing order:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Verify order belongs to user
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Cancel order through matching engine
    if (!matchingEngine) {
      matchingEngine = new MatchingEngine(wsManager);
    }

    const cancelled = await matchingEngine.cancelOrder(orderId);

    if (!cancelled) {
      return NextResponse.json({ error: 'Failed to cancel order' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const artistId = searchParams.get('artistId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {
      userId: session.user.id
    };

    if (artistId) where.artistId = artistId;
    if (status) where.status = status;
    if (type) where.type = type;

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        artist: {
          select: {
            name: true,
            imageUrl: true,
            currentPrice: true
          }
        }
      }
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 