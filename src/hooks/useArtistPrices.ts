import { useState, useEffect, useCallback } from 'react'

interface PriceUpdate {
  id: string
  currentPrice: number
  priceChange24h: number
}

export function useArtistPrices(artistIds: string[]) {
  const [prices, setPrices] = useState<Record<string, PriceUpdate>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/ws'
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      setIsConnected(true)
      setError(null)
      ws.send(JSON.stringify({
        type: 'subscribe',
        artistIds,
      }))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        if (message.type === 'priceUpdate') {
          setPrices((prev) => {
            const updates: Record<string, PriceUpdate> = {}
            message.data.forEach((update: PriceUpdate) => {
              updates[update.id] = update
            })
            return { ...prev, ...updates }
          })
        } else if (message.type === 'error') {
          setError(message.message)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onerror = () => {
      setError('WebSocket connection error')
      setIsConnected(false)
    }

    ws.onclose = () => {
      setIsConnected(false)
      // Attempt to reconnect after 5 seconds
      setTimeout(connect, 5000)
    }

    return () => {
      ws.close()
    }
  }, [artistIds])

  useEffect(() => {
    const cleanup = connect()
    return cleanup
  }, [connect])

  return {
    prices,
    isConnected,
    error,
  }
} 