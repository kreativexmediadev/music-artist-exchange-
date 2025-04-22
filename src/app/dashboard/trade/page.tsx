'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import TradingViewChart from '@/components/TradingViewChart';

// Mock data - Replace with actual API data
const mockMarketData = {
  currentPrice: 25.50,
  priceChange: 1.25,
  priceChangePercent: 5.15,
  volume24h: 150000,
  marketCap: 2500000,
  orderBook: {
    asks: [
      { price: 26.00, quantity: 100 },
      { price: 25.75, quantity: 250 },
      { price: 25.50, quantity: 500 },
    ],
    bids: [
      { price: 25.25, quantity: 300 },
      { price: 25.00, quantity: 400 },
      { price: 24.75, quantity: 200 },
    ],
  },
};

export default function TradePage() {
  const { data: session } = useSession();
  const [selectedArtist, setSelectedArtist] = useState('Drake');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement order submission
    console.log('Order submitted:', {
      artist: selectedArtist,
      type: orderType,
      side,
      amount,
      price: orderType === 'limit' ? price : mockMarketData.currentPrice,
    });
  };

  return (
    <div className="space-y-6">
      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Current Price</h2>
          <div className="text-3xl font-bold text-white">
            ${mockMarketData.currentPrice.toFixed(2)}
          </div>
          <div className={mockMarketData.priceChange >= 0 ? 'text-green-400' : 'text-red-400'}>
            {mockMarketData.priceChange >= 0 ? '+' : ''}
            ${mockMarketData.priceChange.toFixed(2)} ({mockMarketData.priceChangePercent}%)
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">24h Volume</h2>
          <div className="text-3xl font-bold text-white">
            ${mockMarketData.volume24h.toLocaleString()}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Market Cap</h2>
          <div className="text-3xl font-bold text-white">
            ${mockMarketData.marketCap.toLocaleString()}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-2">Your Balance</h2>
          <div className="text-3xl font-bold text-white">$10,000.00</div>
          <div className="text-sm text-gray-400">Available for trading</div>
        </div>
      </div>

      {/* Price Chart */}
      <TradingViewChart />

      {/* Trading Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Place Order</h2>
          <form onSubmit={handleSubmitOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Artist
              </label>
              <select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                className="input w-full"
              >
                <option value="Drake">Drake</option>
                <option value="Taylor Swift">Taylor Swift</option>
                <option value="The Weeknd">The Weeknd</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Order Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOrderType('market')}
                  className={`px-4 py-2 rounded ${
                    orderType === 'market'
                      ? 'bg-accent-yellow text-dark'
                      : 'bg-dark-card text-gray-300'
                  }`}
                >
                  Market
                </button>
                <button
                  type="button"
                  onClick={() => setOrderType('limit')}
                  className={`px-4 py-2 rounded ${
                    orderType === 'limit'
                      ? 'bg-accent-yellow text-dark'
                      : 'bg-dark-card text-gray-300'
                  }`}
                >
                  Limit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Side
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('buy')}
                  className={`px-4 py-2 rounded ${
                    side === 'buy'
                      ? 'bg-green-500 text-white'
                      : 'bg-dark-card text-gray-300'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setSide('sell')}
                  className={`px-4 py-2 rounded ${
                    side === 'sell'
                      ? 'bg-red-500 text-white'
                      : 'bg-dark-card text-gray-300'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Amount (Tokens)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input w-full"
                placeholder="Enter amount"
                min="0"
                step="1"
              />
            </div>

            {orderType === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Price per Token
                </label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="input w-full"
                  placeholder="Enter price"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Total
              </label>
              <div className="text-lg font-bold text-white">
                $
                {amount && (orderType === 'market' ? mockMarketData.currentPrice : price)
                  ? (
                      parseFloat(amount) *
                      (orderType === 'market'
                        ? mockMarketData.currentPrice
                        : parseFloat(price) || 0)
                    ).toFixed(2)
                  : '0.00'}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded font-semibold ${
                side === 'buy'
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              {side === 'buy' ? 'Buy' : 'Sell'} {selectedArtist} Tokens
            </button>
          </form>
        </div>

        {/* Order Book */}
        <div className="card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Order Book</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Asks */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Asks</h3>
              <div className="space-y-2">
                {mockMarketData.orderBook.asks.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-red-400">${order.price.toFixed(2)}</span>
                    <span className="text-gray-300">{order.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bids */}
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-2">Bids</h3>
              <div className="space-y-2">
                {mockMarketData.orderBook.bids.map((order, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-green-400">${order.price.toFixed(2)}</span>
                    <span className="text-gray-300">{order.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 