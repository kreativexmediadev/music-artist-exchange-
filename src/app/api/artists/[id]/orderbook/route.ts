import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { OrderStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get open orders for the artist
    const orders = await prisma.order.findMany({
      where: {
        artistId: params.id,
        status: OrderStatus.OPEN,
      },
      orderBy: {
        price: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    // Separate buy and sell orders
    const buyOrders = orders.filter(order => order.type === 'BUY')
    const sellOrders = orders.filter(order => order.type === 'SELL')

    return NextResponse.json({
      buyOrders,
      sellOrders,
    })
  } catch (error) {
    console.error('Error fetching orderbook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orderbook' },
      { status: 500 }
    )
  }
} 