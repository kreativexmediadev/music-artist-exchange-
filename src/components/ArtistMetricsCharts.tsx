import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js'
import { useState } from 'react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ArtistMetrics {
  social: {
    monthlyListeners: number
    spotifyFollowers: number
    instagramFollowers: number
    twitterFollowers: number
  }
  financial: {
    revenueStreams: Array<{ source: string; percentage: number }>
    quarterlyRevenue: Array<{ quarter: string; amount: number }>
  }
  technical: {
    rsi: number
    macd: number
    movingAverage50d: number
    movingAverage200d: number
    sentimentScore: number
  }
}

interface ArtistMetricsChartsProps {
  metrics: ArtistMetrics
}

export function ArtistMetricsCharts({ metrics }: ArtistMetricsChartsProps) {
  const [activeTab, setActiveTab] = useState<'social' | 'financial' | 'technical'>('social')

  const socialData: ChartData<'line'> = {
    labels: ['Monthly Listeners', 'Spotify Followers', 'Instagram Followers', 'Twitter Followers'],
    datasets: [
      {
        label: 'Social Metrics',
        data: [
          metrics.social.monthlyListeners,
          metrics.social.spotifyFollowers,
          metrics.social.instagramFollowers,
          metrics.social.twitterFollowers,
        ],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.3,
      },
    ],
  }

  const financialData: ChartData<'line'> = {
    labels: metrics.financial.quarterlyRevenue.map((q) => q.quarter),
    datasets: [
      {
        label: 'Quarterly Revenue',
        data: metrics.financial.quarterlyRevenue.map((q) => q.amount),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.3,
      },
    ],
  }

  const technicalData: ChartData<'line'> = {
    labels: ['RSI', 'MACD', '50D MA', '200D MA', 'Sentiment'],
    datasets: [
      {
        label: 'Technical Metrics',
        data: [
          metrics.technical.rsi,
          metrics.technical.macd,
          metrics.technical.movingAverage50d,
          metrics.technical.movingAverage200d,
          metrics.technical.sentimentScore,
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        tension: 0.3,
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Metrics`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'social'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('social')}
        >
          Social
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'financial'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('financial')}
        >
          Financial
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'technical'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('technical')}
        >
          Technical
        </button>
      </div>

      <div className="h-96">
        {activeTab === 'social' && <Line data={socialData} options={chartOptions} />}
        {activeTab === 'financial' && <Line data={financialData} options={chartOptions} />}
        {activeTab === 'technical' && <Line data={technicalData} options={chartOptions} />}
      </div>

      {activeTab === 'financial' && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900">Revenue Streams</h4>
          <div className="mt-2 grid grid-cols-2 gap-4">
            {metrics.financial.revenueStreams.map((stream) => (
              <div
                key={stream.source}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-600">{stream.source}</span>
                <span className="text-sm font-medium">{stream.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 