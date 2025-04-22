'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import useWebSocket from '@/hooks/useWebSocket';

interface Order {
  id: string;
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
  userId: string;
  createdAt: string;
}

interface OrderBook {
  bids: Order[];
  asks: Order[];
}

interface TradingPanelProps {
  artistId: string;
  currentPrice: number;
}

export default function TradingPanel({ artistId, currentPrice }: TradingPanelProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(currentPrice.toString());
  const [error, setError] = useState('');

  // WebSocket connection for real-time order book updates
  const { lastMessage } = useWebSocket(`/api/ws/orderbook/${artistId}`);

  // Fetch initial order book data
  const { data: orderBook, isLoading } = useQuery<OrderBook>({
    queryKey: ['orderBook', artistId],
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}/orderbook`);
      if (!response.ok) throw new Error('Failed to fetch order book');
      return response.json();
    },
    refetchInterval: 10000, // Refetch every 10 seconds as backup
  });

  // Update order book when receiving WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      const updatedOrderBook = JSON.parse(lastMessage.data);
      queryClient.setQueryData(['orderBook', artistId], updatedOrderBook);
    }
  }, [lastMessage, queryClient, artistId]);

  // Place order mutation
  const placeMutation = useMutation({
    mutationFn: async (orderData: {
      type: 'buy' | 'sell';
      price: number;
      quantity: number;
    }) => {
      const response = await fetch(`/api/artists/${artistId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to place order');
      }
      return response.json();
    },
    onSuccess: () => {
      // Reset form and refetch order book
      setQuantity('');
      setPrice(currentPrice.toString());
      setError('');
      queryClient.invalidateQueries({ queryKey: ['orderBook', artistId] });
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError('Please sign in to place orders');
      return;
    }

    const priceNum = parseFloat(price);
    const quantityNum = parseFloat(quantity);

    if (isNaN(priceNum) || isNaN(quantityNum)) {
      setError('Please enter valid numbers for price and quantity');
      return;
    }

    if (priceNum <= 0 || quantityNum <= 0) {
      setError('Price and quantity must be greater than 0');
      return;
    }

    placeMutation.mutate({
      type: orderType,
      price: priceNum,
      quantity: quantityNum,
    });
  };

  const renderOrderBook = (orders: Order[], type: 'buy' | 'sell') => {
    return (
      <div className="space-y-1">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex justify-between items-center text-sm p-2 hover:bg-dark-card/50 rounded"
          >
            <div className="flex items-center space-x-2">
              {type === 'buy' ? (
                <FiArrowUp className="text-green-400" />
              ) : (
                <FiArrowDown className="text-red-400" />
              )}
              <span className="text-gray-300">{order.quantity.toFixed(4)}</span>
            </div>
            <span className={type === 'buy' ? 'text-green-400' : 'text-red-400'}>
              ${order.price.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-dark-card rounded-xl p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-1/4"></div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark-card rounded-xl p-6 shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Book */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Order Book</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Bids</h4>
              {orderBook?.bids && renderOrderBook(orderBook.bids, 'buy')}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Asks</h4>
              {orderBook?.asks && renderOrderBook(orderBook.asks, 'sell')}
            </div>
          </div>
        </div>

        {/* Trading Form */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Place Order</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setOrderType('buy')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  orderType === 'buy'
                    ? 'bg-green-500 text-white'
                    : 'bg-dark-card text-gray-400'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => setOrderType('sell')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  orderType === 'sell'
                    ? 'bg-red-500 text-white'
                    : 'bg-dark-card text-gray-400'
                }`}
              >
                Sell
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-full bg-dark-card text-white p-2 rounded-lg border border-gray-700 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">
                Quantity
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                step="0.0001"
                min="0"
                className="w-full bg-dark-card text-white p-2 rounded-lg border border-gray-700 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-400/10 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!session || placeMutation.isPending}
              className={`w-full py-3 px-4 rounded-lg font-medium ${
                !session
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : orderType === 'buy'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {placeMutation.isPending
                ? 'Processing...'
                : !session
                ? 'Sign in to Trade'
                : `Place ${orderType === 'buy' ? 'Buy' : 'Sell'} Order`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 