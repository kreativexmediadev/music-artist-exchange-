import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { WebSocketManager } from '@/lib/websocket'
import { createServer } from 'http'

const server = createServer()
export const wsManager = new WebSocketManager(server)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const upgrade = req.headers.get('upgrade')

  if (upgrade?.toLowerCase() !== 'websocket') {
    return new NextResponse('Expected Upgrade: WebSocket', { status: 426 })
  }

  try {
    const response = await fetch(req.url, {
      method: req.method,
      headers: {
        upgrade: 'websocket',
      },
    })

    return response
  } catch (error) {
    console.error('WebSocket connection error:', error)
    return new NextResponse('WebSocket connection failed', { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!request.headers.get('upgrade')?.includes('websocket')) {
    return new Response('Expected Upgrade: websocket', { status: 426 })
  }

  const { socket, response } = Deno.upgradeWebSocket(request)

  socket.onopen = () => {
    console.log('WebSocket connection established')
  }

  socket.onmessage = async (event) => {
    try {
      const { type, artistIds } = JSON.parse(event.data)

      if (type === 'subscribe' && Array.isArray(artistIds)) {
        // In a real application, you would store the subscription
        // and set up a mechanism to push updates when prices change
        
        // For now, we'll just send mock updates every few seconds
        setInterval(async () => {
          const updates = await Promise.all(
            artistIds.map(async (id) => {
              const artist = await prisma.artist.findUnique({
                where: { id },
                select: {
                  id: true,
                  currentPrice: true,
                  priceChange24h: true,
                },
              })

              if (artist) {
                // Simulate price movement
                const priceChange = (Math.random() - 0.5) * 0.02 // ±1% change
                const newPrice = artist.currentPrice * (1 + priceChange)
                
                await prisma.artist.update({
                  where: { id },
                  data: {
                    currentPrice: newPrice,
                    priceChange24h: priceChange * 100,
                  },
                })

                return {
                  id,
                  currentPrice: newPrice,
                  priceChange24h: priceChange * 100,
                }
              }
            })
          )

          socket.send(JSON.stringify({
            type: 'priceUpdate',
            data: updates.filter(Boolean),
          }))
        }, 5000) // Update every 5 seconds
      }
    } catch (error) {
      console.error('WebSocket error:', error)
      socket.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
      }))
    }
  }

  socket.onerror = (error) => {
    console.error('WebSocket error:', error)
  }

  socket.onclose = () => {
    console.log('WebSocket connection closed')
  }

  return response
} 