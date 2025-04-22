import { prisma } from '@/lib/prisma'

interface MarketMetrics {
  rsi: number
  macd: number
  movingAverage50d: number
  movingAverage200d: number
}

export async function calculateMarketMetrics(artistId: string): Promise<MarketMetrics> {
  // Fetch historical prices for the last 200 days
  const trades = await prisma.trade.findMany({
    where: { artistId },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  const prices = trades.map(t => t.price).reverse()

  // Calculate RSI (14-period)
  const rsi = calculateRSI(prices, 14)

  // Calculate MACD (12, 26, 9)
  const macd = calculateMACD(prices)

  // Calculate moving averages
  const ma50 = calculateMA(prices, 50)
  const ma200 = calculateMA(prices, 200)

  return {
    rsi,
    macd: macd.histogram,
    movingAverage50d: ma50,
    movingAverage200d: ma200,
  }
}

function calculateRSI(prices: number[], period: number): number {
  if (prices.length < period + 1) {
    return 50 // Default value if not enough data
  }

  let gains = 0
  let losses = 0

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const difference = prices[i] - prices[i - 1]
    if (difference >= 0) {
      gains += difference
    } else {
      losses -= difference
    }
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  // Calculate RSI using smoothed averages
  for (let i = period + 1; i < prices.length; i++) {
    const difference = prices[i] - prices[i - 1]
    if (difference >= 0) {
      avgGain = (avgGain * (period - 1) + difference) / period
      avgLoss = (avgLoss * (period - 1)) / period
    } else {
      avgGain = (avgGain * (period - 1)) / period
      avgLoss = (avgLoss * (period - 1) - difference) / period
    }
  }

  const rs = avgGain / avgLoss
  return 100 - (100 / (1 + rs))
}

function calculateMACD(prices: number[]): { line: number; signal: number; histogram: number } {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macdLine = ema12 - ema26
  const signalLine = calculateEMA([macdLine], 9)
  const histogram = macdLine - signalLine

  return {
    line: macdLine,
    signal: signalLine,
    histogram,
  }
}

function calculateMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices[prices.length - 1] // Return last price if not enough data
  }

  const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
  return sum / period
}

function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return prices[prices.length - 1] // Return last price if not enough data
  }

  const multiplier = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }

  return ema
}

export async function calculateTokenPrice(artistId: string): Promise<number> {
  // Fetch recent trades
  const recentTrades = await prisma.trade.findMany({
    where: { artistId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  if (recentTrades.length === 0) {
    return 0 // No trades yet
  }

  // Calculate volume-weighted average price (VWAP)
  const { totalValue, totalVolume } = recentTrades.reduce(
    (acc, trade) => ({
      totalValue: acc.totalValue + trade.price * trade.amount,
      totalVolume: acc.totalVolume + trade.amount,
    }),
    { totalValue: 0, totalVolume: 0 }
  )

  return totalVolume > 0 ? totalValue / totalVolume : recentTrades[0].price
}

export async function updateArtistMetrics(artistId: string) {
  const [marketMetrics, currentPrice] = await Promise.all([
    calculateMarketMetrics(artistId),
    calculateTokenPrice(artistId),
  ])

  // Get previous price for 24h change calculation
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  const previousTrade = await prisma.trade.findFirst({
    where: {
      artistId,
      createdAt: { lt: oneDayAgo },
    },
    orderBy: { createdAt: 'desc' },
  })

  const previousPrice = previousTrade?.price ?? currentPrice
  const priceChange24h = ((currentPrice - previousPrice) / previousPrice) * 100

  // Update artist metrics
  await prisma.artist.update({
    where: { id: artistId },
    data: {
      currentPrice,
      priceChange24h,
      metrics: {
        update: {
          technical: {
            update: {
              rsi: marketMetrics.rsi,
              macd: marketMetrics.macd,
              movingAverage50d: marketMetrics.movingAverage50d,
              movingAverage200d: marketMetrics.movingAverage200d,
            },
          },
        },
      },
    },
  })

  return {
    currentPrice,
    priceChange24h,
    ...marketMetrics,
  }
} 