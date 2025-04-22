'use client'

import { useState, useEffect } from 'react'

interface TradeFormProps {
  artistId: string | null
}

export default function TradeForm({ artistId }: TradeFormProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [price, setPrice] = useState<string>('')
  const [quantity, setQuantity] = useState<string>('')
  const [total, setTotal] = useState<number>(0)

  // Sample market price - will be replaced with real-time data
  const marketPrice = 1245.00

  useEffect(() => {
    const priceNum = orderType === 'market' ? marketPrice : parseFloat(price) || 0
    const quantityNum = parseFloat(quantity) || 0
    setTotal(priceNum * quantityNum)
  }, [price, quantity, orderType])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle order submission
    console.log({
      orderType,
      side,
      price: orderType === 'market' ? marketPrice : parseFloat(price),
      quantity: parseFloat(quantity),
      total,
      artistId
    })
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Place Order</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`py-2 rounded-lg font-medium ${
              orderType === 'market'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setOrderType('market')}
          >
            Market
          </button>
          <button
            type="button"
            className={`py-2 rounded-lg font-medium ${
              orderType === 'limit'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setOrderType('limit')}
          >
            Limit
          </button>
        </div>

        {/* Buy/Sell Selection */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={`py-2 rounded-lg font-medium ${
              side === 'buy'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSide('buy')}
          >
            Buy
          </button>
          <button
            type="button"
            className={`py-2 rounded-lg font-medium ${
              side === 'sell'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setSide('sell')}
          >
            Sell
          </button>
        </div>

        {/* Price Input */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input pl-8 w-full"
                placeholder="0.00"
                required
              />
            </div>
          </div>
        )}

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="input w-full"
            placeholder="0.00"
            required
          />
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Price</span>
            <span className="font-medium">
              ${orderType === 'market' ? marketPrice.toFixed(2) : price || '0.00'}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Quantity</span>
            <span className="font-medium">{quantity || '0.00'}</span>
          </div>
          <div className="flex justify-between text-sm font-medium pt-2 border-t">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full py-3 rounded-lg font-medium text-white ${
            side === 'buy'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700'
          }`}
          disabled={!artistId}
        >
          {artistId
            ? `${side === 'buy' ? 'Buy' : 'Sell'} ${
                orderType === 'market' ? 'at Market Price' : 'at Limit Price'
              }`
            : 'Select an artist to trade'}
        </button>
      </form>
    </div>
  )
} 