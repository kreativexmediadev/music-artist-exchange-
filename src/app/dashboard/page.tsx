'use client';

import { useState } from 'react';
import { getTokenPrice } from '@/lib/tokenUtils';
import Image from 'next/image';
import Link from 'next/link';
import useSWR from 'swr';
import { useToast } from '@/hooks/useToast';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

interface PortfolioItem {
  artist: {
    id: string;
    name: string;
    image: string;
    tokenSupply: number;
    tokensSold: number;
  };
  amount: number;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
};

export default function Dashboard() {
  const { toast, error } = useToast();
  const { data: portfolio, error: portfolioError, mutate: mutatePortfolio } = useSWR(
    '/api/portfolio',
    fetcher,
    {
      refreshInterval: 30000,
      onError: () => error('Failed to load portfolio', 'Please try again later'),
    }
  );

  const totalValue = portfolio?.reduce((sum: number, item: any) => {
    const price = getTokenPrice(item.artist);
    return sum + (item.amount * price);
  }, 0) || 0;

  if (portfolioError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Failed to load portfolio</h2>
            <button
              onClick={() => mutatePortfolio()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingState type="card" count={3} />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Portfolio Summary */}
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 mb-8">
            <h1 className="text-2xl font-bold mb-4">Your Portfolio</h1>
            <div className="text-3xl font-bold text-teal-500">
              ${totalValue.toLocaleString()}
            </div>
            <p className="text-gray-400 mt-2">Total Portfolio Value</p>
          </div>

          {/* Portfolio Grid */}
          {portfolio.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-4">No tokens in your portfolio</h2>
              <p className="text-gray-400 mb-6">Start investing in artists to build your portfolio</p>
              <Link
                href="/artists"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-500 hover:bg-teal-600"
              >
                Browse Artists
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item: any) => {
                const price = getTokenPrice(item.artist);
                const value = item.amount * price;
                const progress = (item.artist.tokensSold / item.artist.tokenSupply) * 100;

                return (
                  <Link
                    key={item.artist.id}
                    href={`/artist/${item.artist.id}`}
                    className="bg-gray-800 rounded-lg shadow-xl overflow-hidden hover:bg-gray-700 transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={item.artist.image}
                            alt={item.artist.name}
                            fill
                            className="rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{item.artist.name}</h3>
                          <p className="text-gray-400">{item.artist.genre}</p>
                        </div>
                      </div>

                      <div className="mt-6 space-y-4">
                        <div>
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Tokens Owned</span>
                            <span>{item.amount.toLocaleString()}</span>
                          </div>
                          <div className="mt-1 w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-400">Current Price</p>
                            <p className="text-lg font-semibold">${price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Total Value</p>
                            <p className="text-lg font-semibold">${value.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={toast.hideToast}
      />
    </ErrorBoundary>
  );
} 