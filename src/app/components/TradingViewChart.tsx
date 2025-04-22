'use client'

import { useEffect, useRef } from 'react'
import { createChart, ColorType, UTCTimestamp } from 'lightweight-charts'

interface TradingViewChartProps {
  artistId: string | null
}

interface ChartData {
  time: UTCTimestamp
  open: number
  high: number
  low: number
  close: number
}

export default function TradingViewChart({ artistId }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!chartContainerRef.current) return

    // Create chart instance with dark theme
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1a2236' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#232b3d' },
        horzLines: { color: '#232b3d' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      crosshair: {
        mode: 1,
        vertLine: {
          color: '#ffc600',
          width: 1,
          style: 3,
          labelBackgroundColor: '#ffc600',
        },
        horzLine: {
          color: '#ffc600',
          width: 1,
          style: 3,
          labelBackgroundColor: '#ffc600',
        },
      },
    })

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    })

    // Sample data - this will be replaced with real data from an API
    const sampleData: ChartData[] = [
      { time: 1612291200 as UTCTimestamp, open: 1000, high: 1050, low: 990, close: 1020 },
      { time: 1612377600 as UTCTimestamp, open: 1020, high: 1100, low: 1010, close: 1090 },
      { time: 1612464000 as UTCTimestamp, open: 1090, high: 1120, low: 1060, close: 1070 },
      // Add more data points...
    ]

    candlestickSeries.setData(sampleData)

    // Add volume series
    const volumeSeries = chart.addHistogramSeries({
      color: '#22c55e',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    })

    const volumeData = sampleData.map(item => ({
      time: item.time,
      value: Math.random() * 100000,
      color: item.close >= item.open ? '#22c55e' : '#ef4444'
    }))

    volumeSeries.setData(volumeData)

    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Store chart reference
    chartRef.current = chart

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [artistId])

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Price Chart</h2>
          <p className="text-sm text-gray-400">
            {artistId ? 'Loading artist data...' : 'Select an artist to view chart'}
          </p>
        </div>
        <div className="flex space-x-2">
          {['1H', '1D', '1W', '1M', '1Y'].map((interval) => (
            <button
              key={interval}
              className="px-3 py-1 text-sm font-medium bg-[#232b3d] text-gray-300 hover:text-[#ffc600] rounded-lg transition-colors"
            >
              {interval}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="h-[500px] chart-container" />
    </div>
  )
} 