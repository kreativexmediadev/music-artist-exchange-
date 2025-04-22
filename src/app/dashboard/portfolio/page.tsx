'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { PortfolioData, TimeFrame } from '@/types/portfolio';

// Mock data - Replace with actual API calls
const mockPortfolioData: PortfolioData = {
  totalValue: 25000,
  totalProfit: 3750,
  profitPercentage: 17.65,
  holdings: [
    {
      id: 1,
      artist: 'Drake',
      tokens: 1000,
      averagePrice: 22.50,
      currentPrice: 25.50,
      value: 25500,
      profit: 3000,
      profitPercentage: 13.33,
      allocation: 40,
    },
    {
      id: 2,
      artist: 'Taylor Swift',
      tokens: 500,
      averagePrice: 40.00,
      currentPrice: 45.75,
      value: 22875,
      profit: 2875,
      profitPercentage: 14.38,
      allocation: 35,
    },
    {
      id: 3,
      artist: 'The Weeknd',
      tokens: 450,
      averagePrice: 30.00,
      currentPrice: 32.80,
      value: 14760,
      profit: 1260,
      profitPercentage: 9.33,
      allocation: 25,
    },
  ],
  recentTransactions: [
    {
      id: 1,
      type: 'BUY',
      artist: 'Drake',
      tokens: 100,
      price: 25.50,
      total: 2550,
      timestamp: '2024-03-15T10:30:00Z',
    },
    {
      id: 2,
      type: 'SELL',
      artist: 'Taylor Swift',
      tokens: 50,
      price: 45.75,
      total: 2287.50,
      timestamp: '2024-03-15T09:15:00Z',
    },
  ],
};

export default function PortfolioPage() {
  const { data: session } = useSession();
  const [timeframe, setTimeframe] = useState<TimeFrame>('1D');

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <div className="flex space-x-2">
          {(['1D', '1W', '1M', '1Y'] as TimeFrame[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded ${
                timeframe === tf
                  ? 'bg-accent-yellow text-dark'
                  : 'bg-dark-card text-gray-300 hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Total Value</h2>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-white">
              ${mockPortfolioData.totalValue.toLocaleString()}
            </div>
            <div className={`text-sm ${mockPortfolioData.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {mockPortfolioData.totalProfit >= 0 ? '+' : ''}
              ${mockPortfolioData.totalProfit.toLocaleString()} ({mockPortfolioData.profitPercentage}%)
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Portfolio Allocation</h2>
          <div className="space-y-4">
            {mockPortfolioData.holdings.map((holding) => (
              <div key={holding.id} className="flex items-center space-x-2">
                <div className="w-full bg-dark rounded-full h-2">
                  <div
                    className="bg-accent-yellow rounded-full h-2"
                    style={{ width: `${holding.allocation}%` }}
                  />
                </div>
                <span className="text-sm text-gray-300 whitespace-nowrap">
                  {holding.artist} ({holding.allocation}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="btn-primary py-2">Buy Tokens</button>
            <button className="btn-secondary py-2">Sell Tokens</button>
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Holdings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-800">
                <th className="pb-4">Artist</th>
                <th className="pb-4">Tokens</th>
                <th className="pb-4">Avg. Price</th>
                <th className="pb-4">Current Price</th>
                <th className="pb-4">Value</th>
                <th className="pb-4">Profit/Loss</th>
              </tr>
            </thead>
            <tbody>
              {mockPortfolioData.holdings.map((holding) => (
                <tr key={holding.id} className="border-b border-gray-800">
                  <td className="py-4">
                    <div className="font-medium text-white">{holding.artist}</div>
                  </td>
                  <td className="py-4">{holding.tokens.toLocaleString()}</td>
                  <td className="py-4">${holding.averagePrice.toFixed(2)}</td>
                  <td className="py-4">${holding.currentPrice.toFixed(2)}</td>
                  <td className="py-4">${holding.value.toLocaleString()}</td>
                  <td className="py-4">
                    <div className={holding.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {holding.profit >= 0 ? '+' : ''}${holding.profit.toLocaleString()} ({holding.profitPercentage}%)
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-300 mb-4">Recent Transactions</h2>
        <div className="space-y-4">
          {mockPortfolioData.recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center p-4 bg-dark rounded-lg"
            >
              <div>
                <div className="font-medium text-white">{transaction.artist}</div>
                <div className="text-sm text-gray-400">
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </div>
              </div>
              <div className="text-right">
                <div className={transaction.type === 'BUY' ? 'text-green-400' : 'text-red-400'}>
                  {transaction.type} {transaction.tokens} @ ${transaction.price}
                </div>
                <div className="text-sm text-gray-400">
                  ${transaction.total.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 