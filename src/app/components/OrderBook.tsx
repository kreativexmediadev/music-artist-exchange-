'use client'

import { useState } from 'react'

interface Order {
  price: number
  size: number
  total: number
}

interface OrderBookProps {
  artistId: string | null
}

export default function OrderBook({ artistId }: OrderBookProps) {
  // Sample data - will be replaced with real-time data
  const [buyOrders] = useState<Order[]>([
    { price: 1245.00, size: 10, total: 12450.00 },
    { price: 1244.50, size: 15, total: 18667.50 },
    { price: 1244.00, size: 5, total: 6220.00 },
    { price: 1243.50, size: 20, total: 24870.00 },
    { price: 1243.00, size: 8, total: 9944.00 },
  ])

  const [sellOrders] = useState<Order[]>([
    { price: 1245.50, size: 12, total: 14946.00 },
    { price: 1246.00, size: 8, total: 9968.00 },
    { price: 1246.50, size: 15, total: 18697.50 },
    { price: 1247.00, size: 6, total: 7482.00 },
    { price: 1247.50, size: 10, total: 12475.00 },
  ])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  }

  const formatPrice = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(num)
  }

  // Calculate the maximum total for proper scaling
  const maxTotal = Math.max(
    ...buyOrders.map(order => order.total),
    ...sellOrders.map(order => order.total)
  )

  const renderOrderRow = (order: Order, type: 'buy' | 'sell') => {
    const percentage = (order.total / maxTotal) * 100
    const bgColorClass = type === 'buy' ? 'depth-bg-buy' : 'depth-bg-sell'

    return (
      <div key={`${type}-${order.price}`} className="relative h-8 flex items-center text-sm order-book-row">
        <div
          className={`absolute ${type === 'buy' ? 'right-0' : 'left-0'} h-full ${bgColorClass}`}
          style={{ width: `${percentage}%` }}
        />
        <div className="relative grid grid-cols-3 w-full px-4 z-10">
          <span className={type === 'buy' ? 'text-green-400' : 'text-red-400'}>
            {formatPrice(order.price)}
          </span>
          <span className="text-center text-gray-300">{formatNumber(order.size)}</span>
          <span className="text-right text-gray-300">{formatPrice(order.total)}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="card h-full">
      <h2 className="text-lg font-semibold mb-4 text-white">Order Book</h2>
      
      <div className="grid grid-cols-3 text-xs table-header px-4 mb-2">
        <span>Price</span>
        <span className="text-center">Size</span>
        <span className="text-right">Total</span>
      </div>

      {/* Sell orders (displayed in reverse order) */}
      <div className="mb-4">
        {[...sellOrders].reverse().map(order => renderOrderRow(order, 'sell'))}
      </div>

      {/* Spread */}
      <div className="text-center py-2 text-sm text-gray-400 border-y border-gray-800">
        Spread: {formatPrice(sellOrders[0].price - buyOrders[0].price)} ({((sellOrders[0].price / buyOrders[0].price - 1) * 100).toFixed(2)}%)
      </div>

      {/* Buy orders */}
      <div className="mt-4">
        {buyOrders.map(order => renderOrderRow(order, 'buy'))}
      </div>
    </div>
  )
} 