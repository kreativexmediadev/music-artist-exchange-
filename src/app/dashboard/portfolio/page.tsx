'use client';

import { useUser } from '@/contexts/UserContext';
import { formatCurrency, formatPercentage } from '@/utils/format';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PortfolioData {
  portfolio: Array<{
    id: string;
    amount: number;
    currentValue: number;
    valueChange24h: number;
    artist: {
      id: string;
      name: string;
      imageUrl: string;
      tokenSymbol: string;
      currentPrice: number;
      priceChange24h: number;
    };
  }>;
  summary: {
    totalValue: number;
    totalValueChange24h: number;
    percentageChange24h: number;
  };
}

// Mock portfolio data
const mockPortfolio: PortfolioData = {
  portfolio: [
    {
      id: '1',
      amount: 10,
      currentValue: 1500,
      valueChange24h: 50,
      artist: {
        id: '1',
        name: 'Taylor Swift',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb5a00969a4698c3132a15fbb0',
        tokenSymbol: 'SWIFT',
        currentPrice: 150,
        priceChange24h: 5,
      },
    },
    {
      id: '2',
      amount: 5,
      currentValue: 600,
      valueChange24h: -20,
      artist: {
        id: '2',
        name: 'Drake',
        imageUrl: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9',
        tokenSymbol: 'DRAKE',
        currentPrice: 120,
        priceChange24h: -4,
      },
    },
  ],
  summary: {
    totalValue: 2100,
    totalValueChange24h: 30,
    percentageChange24h: 1.5,
  },
};

// Mock chart data
const generateChartData = () => {
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const data = Array.from({ length: 24 }, () => Math.random() * 1000 + 1500);
  return { labels, data };
};

export default function PortfolioPage() {
  const portfolio = mockPortfolio;
  const [chartData, setChartData] = useState(generateChartData());
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setChartData(prev => ({
        ...prev,
        data: prev.data.map(value => value * (1 + (Math.random() - 0.5) * 0.02)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const chartConfig = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Portfolio Value',
        data: chartData.data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setChartData(generateChartData());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Card */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Portfolio Overview</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleRefresh}
              className={`px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors ${
                isRefreshing ? 'animate-spin' : ''
              }`}
            >
              ↻ Refresh
            </button>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="24h">24h</option>
              <option value="7d">7d</option>
              <option value="30d">30d</option>
              <option value="1y">1y</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-gray-500">Total Value</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              {formatCurrency(portfolio.summary.totalValue)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-gray-500">24h Change</h3>
            <p className={`mt-2 text-3xl font-bold ${
              portfolio.summary.totalValueChange24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(portfolio.summary.totalValueChange24h)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-lg border border-indigo-100">
            <h3 className="text-sm font-medium text-gray-500">24h Change %</h3>
            <p className={`mt-2 text-3xl font-bold ${
              portfolio.summary.percentageChange24h >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercentage(portfolio.summary.percentageChange24h)}
            </p>
          </div>
        </div>

        {/* Portfolio Chart */}
        <div className="h-64">
          <Line data={chartConfig} options={chartOptions} />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">Holdings</h2>
            <div className="flex space-x-2">
              <button className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors">
                Buy
              </button>
              <button className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100 transition-colors">
                Sell
              </button>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  24h Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {portfolio.portfolio.map((holding) => (
                <tr key={holding.artist.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={holding.artist.imageUrl}
                          alt={holding.artist.name}
                          onError={(e) => {
                            e.currentTarget.src = '/default-artist.png';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {holding.artist.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {holding.artist.tokenSymbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {holding.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(holding.artist.currentPrice)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(holding.currentValue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      holding.valueChange24h >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {formatCurrency(holding.valueChange24h)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">Trade</button>
                      <button className="text-gray-600 hover:text-gray-900">Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 