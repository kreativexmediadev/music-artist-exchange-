'use client';

import { useEffect, useRef } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';

interface TradingViewChartProps {
  data: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
  }[];
}

// Mock data - Replace with actual API data
const mockChartData = [
  { time: '2024-01-01', open: 25.0, high: 25.5, low: 24.8, close: 25.2 },
  { time: '2024-01-02', open: 25.2, high: 26.0, low: 25.0, close: 25.8 },
  { time: '2024-01-03', open: 25.8, high: 26.2, low: 25.5, close: 25.7 },
  { time: '2024-01-04', open: 25.7, high: 25.9, low: 25.1, close: 25.3 },
  { time: '2024-01-05', open: 25.3, high: 25.8, low: 25.2, close: 25.5 },
];

export default function TradingViewChart({ data = mockChartData }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#1a1a1a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#2d2d2d' },
        horzLines: { color: '#2d2d2d' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
      },
      rightPriceScale: {
        borderColor: '#2d2d2d',
      },
      timeScale: {
        borderColor: '#2d2d2d',
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    candlestickSeries.setData(data);

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold text-gray-300 mb-4">Price Chart</h2>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
} 