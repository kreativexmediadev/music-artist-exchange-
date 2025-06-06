'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Artist } from '@/types/artist';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import {
  FaSpotify,
  FaInstagram,
  FaTwitter,
  FaYoutube,
  FaGlobe,
  FaChartLine,
  FaUsers,
  FaMusic,
  FaDollarSign
} from 'react-icons/fa';
import { getTokenPrice } from '@/lib/tokenUtils';
import { toast } from 'react-hot-toast';
import TransactionHistory from '@/components/TransactionHistory';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import useSWR from 'swr';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Image from 'next/image';
import { useToast } from '@/hooks/useToast';
import LoadingState from '@/components/ui/LoadingState';
import Toast from '@/components/ui/Toast';
import ErrorBoundary from '@/components/ErrorBoundary';

// Generate mock data
const generateMockData = () => {
  const data = [];
  const baseStreams = 10000;
  const basePrice = 10;
  const growthRate = 1.1;
  const volatility = 0.1;

  for (let i = 0; i < 30; i++) {
    const streams = Math.floor(baseStreams * Math.pow(growthRate, i));
    const price = basePrice * Math.pow(growthRate, i) * (1 + (Math.random() - 0.5) * volatility);
    data.push({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      streams,
      price: parseFloat(price.toFixed(2)),
      volume: Math.floor(streams * 0.1 * (1 + Math.random() * 0.5))
    });
  }

  return data;
};

// Generate mock stream data
const generateStreamData = () => {
  const data = [];
  const baseStreams = 120;
  const growthRate = 1.1; // 10% daily growth

  for (let i = 0; i < 30; i++) {
    data.push({
      date: `Day ${i + 1}`,
      streams: Math.floor(baseStreams * Math.pow(growthRate, i))
    });
  }

  return data;
};

const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) {
    throw new Error('Failed to fetch artist data');
  }
  return res.json();
});

export default function ArtistProfile() {
  const params = useParams();
  const { toast, success, error } = useToast();
  const { data: artistData, error: artistError, mutate: mutateArtist } = useSWR(
    `/api/artists/${params.id}`,
    fetcher,
    {
      refreshInterval: 30000,
      onError: () => error('Failed to load artist data', 'Please try again later'),
    }
  );

  const { data: transactions, error: transactionsError, mutate: mutateTransactions } = useSWR(
    `/api/token/transactions/${params.id}`,
    fetcher,
    {
      refreshInterval: 30000,
      onError: () => error('Failed to load transactions', 'Please try again later'),
    }
  );

  const [mockData] = useState(generateMockData());
  const [streamData] = useState(generateStreamData());
  const [activeTab, setActiveTab] = useState<'streams' | 'price'>('streams');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState<{
    type: 'BUY' | 'SELL';
    amount: number;
  } | null>(null);

  const handleTransaction = async (type: 'BUY' | 'SELL', amount: number) => {
    try {
      setPendingTransaction({ type, amount });
      setIsConfirmModalOpen(true);
    } catch (err) {
      error('Transaction failed', 'Please try again');
    }
  };

  const confirmTransaction = async () => {
    if (!pendingTransaction) return;

    try {
      const response = await fetch(
        `/api/token/${pendingTransaction.type}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            artistId: params.id,
            amount: pendingTransaction.amount,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Transaction failed');
      }

      const data = await response.json();
      
      // Update local data
      mutateArtist();
      mutateTransactions();
      
      success(
        `Successfully ${pendingTransaction.type === 'BUY' ? 'bought' : 'sold'} tokens`,
        `Transaction completed for ${pendingTransaction.amount} tokens`
      );
    } catch (err) {
      error('Transaction failed', 'Please try again');
    } finally {
      setIsConfirmModalOpen(false);
      setPendingTransaction(null);
    }
  };

  if (artistError) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Failed to load artist data</h2>
            <button
              onClick={() => mutateArtist()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!artistData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-4">
        <div className="max-w-7xl mx-auto">
          <LoadingState type="profile" />
        </div>
      </div>
    );
  }

  const tokenProgress = (artistData.tokensSold / artistData.tokenSupply) * 100;
  const currentPrice = getTokenPrice(artistData);
  const priceChange = ((currentPrice - mockData[0].price) / mockData[0].price) * 100;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Artist Profile Section */}
          <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="relative h-48 sm:h-64">
              <Image
                src={artistData.image}
                alt={artistData.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">{artistData.name}</h1>
                <p className="text-gray-300 mt-2">{artistData.genre}</p>
              </div>
            </div>

            {/* Artist Info */}
            <div className="p-4 sm:p-6">
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300">{artistData.bio}</p>
              </div>

              {/* Daily Streams Chart */}
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">Daily Stream Counts</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={streamData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        tick={{ fill: '#9ca3af' }}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1f2937',
                          border: 'none',
                          borderRadius: '0.5rem',
                          color: '#fff'
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()} streams`, 'Streams']}
                      />
                      <Line
                        type="monotone"
                        dataKey="streams"
                        stroke="#14b8a6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Social Links */}
              <div className="mt-6 flex flex-wrap gap-4">
                {artistData.socialLinks.spotify && (
                  <a
                    href={artistData.socialLinks.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-green-500 transition-colors"
                  >
                    <FaSpotify className="w-6 h-6" />
                  </a>
                )}
                {artistData.socialLinks.instagram && (
                  <a
                    href={artistData.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-pink-500 transition-colors"
                  >
                    <FaInstagram className="w-6 h-6" />
                  </a>
                )}
                {artistData.socialLinks.twitter && (
                  <a
                    href={artistData.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-400 transition-colors"
                  >
                    <FaTwitter className="w-6 h-6" />
                  </a>
                )}
                {artistData.socialLinks.youtube && (
                  <a
                    href={artistData.socialLinks.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FaYoutube className="w-6 h-6" />
                  </a>
                )}
                {artistData.socialLinks.website && (
                  <a
                    href={artistData.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-teal-500 transition-colors"
                  >
                    <FaGlobe className="w-6 h-6" />
                  </a>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center text-gray-300">
                    <FaChartLine className="w-5 h-5 mr-2" />
                    <span className="text-sm">Current Price</span>
                  </div>
                  <div className="mt-2 text-white text-xl font-semibold">
                    ${currentPrice.toFixed(2)}
                  </div>
                  <div className={`text-sm ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(1)}%
                  </div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center text-gray-300">
                    <FaUsers className="w-5 h-5 mr-2" />
                    <span className="text-sm">Token Holders</span>
                  </div>
                  <div className="mt-2 text-white text-xl font-semibold">
                    {Math.floor(artistData.tokensSold / 10)}
                  </div>
                  <div className="text-sm text-gray-400">Unique holders</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center text-gray-300">
                    <FaMusic className="w-5 h-5 mr-2" />
                    <span className="text-sm">Total Streams</span>
                  </div>
                  <div className="mt-2 text-white text-xl font-semibold">
                    {(mockData[mockData.length - 1].streams / 1000).toFixed(1)}k
                  </div>
                  <div className="text-sm text-gray-400">Last 30 days</div>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center text-gray-300">
                    <FaDollarSign className="w-5 h-5 mr-2" />
                    <span className="text-sm">Market Cap</span>
                  </div>
                  <div className="mt-2 text-white text-xl font-semibold">
                    ${(currentPrice * artistData.tokenSupply).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-400">Total value</div>
                </div>
              </div>

              {/* Token Progress */}
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Token Progress</span>
                  <span>{tokenProgress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-teal-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${tokenProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{artistData.tokensSold} tokens sold</span>
                  <span>{artistData.tokenSupply} total supply</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-4 sm:p-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setActiveTab('streams')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'streams'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Stream Growth
              </button>
              <button
                onClick={() => setActiveTab('price')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'price'
                    ? 'bg-teal-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Price History
              </button>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                {activeTab === 'streams' ? (
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} streams`, 'Streams']}
                    />
                    <Area
                      type="monotone"
                      dataKey="streams"
                      stroke="#14b8a6"
                      fillOpacity={1}
                      fill="url(#colorStreams)"
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={mockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      tick={{ fill: '#9ca3af' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: 'none',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#14b8a6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Token Trading Section */}
          <div className="mt-8 bg-gray-800 rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Trade Tokens</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300">
                  Amount
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="amount"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white pr-12 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="0"
                    min="1"
                    max={artistData.tokenSupply - artistData.tokensSold}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 sm:text-sm">TOKENS</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-400">
                <p>Current Price: ${currentPrice.toFixed(2)} per token</p>
                <p>Total Cost: ${(Number(purchaseAmount) * currentPrice).toFixed(2)}</p>
                <p>Available Tokens: {(artistData.tokenSupply - artistData.tokensSold).toLocaleString()}</p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleTransaction('BUY', Number(purchaseAmount))}
                  disabled={isPurchasing || !purchaseAmount}
                  className={`flex-1 bg-teal-500 text-white px-4 py-2 rounded-lg transition-colors ${
                    isPurchasing || !purchaseAmount
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-teal-600'
                  }`}
                >
                  {isPurchasing ? 'Processing...' : 'Buy Tokens'}
                </button>
                <button
                  onClick={() => handleTransaction('SELL', Number(purchaseAmount))}
                  disabled={isPurchasing || !purchaseAmount}
                  className={`flex-1 bg-red-500 text-white px-4 py-2 rounded-lg transition-colors ${
                    isPurchasing || !purchaseAmount
                      ? 'opacity-50 cursor-not-allowed'
                      : 'hover:bg-red-600'
                  }`}
                >
                  {isPurchasing ? 'Processing...' : 'Sell Tokens'}
                </button>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
            {transactionsError ? (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Failed to load transactions</p>
                <button
                  onClick={() => mutateTransactions()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : !transactions ? (
              <LoadingState type="list" count={3} />
            ) : (
              <TransactionHistory transactions={transactions} />
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Transition appear show={isConfirmModalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-10 overflow-y-auto"
          onClose={() => setIsConfirmModalOpen(false)}
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span
              className="inline-block h-screen align-middle"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 shadow-xl rounded-2xl">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white"
                >
                  Confirm {pendingTransaction?.type === 'BUY' ? 'Purchase' : 'Sale'}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to {pendingTransaction?.type === 'BUY' ? 'purchase' : 'sell'}{' '}
                    {pendingTransaction?.amount} tokens at ${currentPrice.toFixed(2)} per token?
                  </p>
                  <p className="mt-2 text-sm text-gray-300">
                    Total: ${(pendingTransaction?.amount || 0) * currentPrice}
                  </p>
                </div>

                <div className="mt-4 flex space-x-4">
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-teal-500 border border-transparent rounded-md hover:bg-teal-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-teal-500"
                    onClick={confirmTransaction}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-transparent rounded-md hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                    onClick={() => setIsConfirmModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

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