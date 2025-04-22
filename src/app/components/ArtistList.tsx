'use client'

import { useState } from 'react'

interface Artist {
  id: string
  name: string
  price: number
  change24h: number
  marketCap: number
  volume24h: number
}

interface ArtistListProps {
  onSelectArtist: (artistId: string) => void
  selectedArtist: string | null
}

export default function ArtistList({ onSelectArtist, selectedArtist }: ArtistListProps) {
  // This will be replaced with real data from an API
  const [artists] = useState<Artist[]>([
    {
      id: '1',
      name: 'Taylor Swift',
      price: 1250.00,
      change24h: 2.5,
      marketCap: 1250000000,
      volume24h: 5000000
    },
    {
      id: '2',
      name: 'Drake',
      price: 980.50,
      change24h: -1.2,
      marketCap: 980500000,
      volume24h: 3500000
    },
    {
      id: '3',
      name: 'Ed Sheeran',
      price: 750.25,
      change24h: 0.8,
      marketCap: 750250000,
      volume24h: 2500000
    }
  ])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatMarketCap = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
    return formatNumber(num)
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-white">Artists</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search artists..."
            className="input text-sm pr-8"
          />
          <svg
            className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-4">
        {artists.map((artist) => (
          <div
            key={artist.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedArtist === artist.id
                ? 'bg-[#232b3d] border border-[#ffc600]'
                : 'hover:bg-[#232b3d] border border-transparent'
            }`}
            onClick={() => onSelectArtist(artist.id)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium text-white">{artist.name}</span>
              <span className="font-semibold text-[#ffc600]">{formatNumber(artist.price)}</span>
            </div>
            
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-400">24h Change</span>
                <span className={`block font-medium ${
                  artist.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {artist.change24h > 0 ? '+' : ''}{artist.change24h}%
                </span>
              </div>
              <div>
                <span className="text-gray-400">Market Cap</span>
                <span className="block font-medium text-gray-300">
                  {formatMarketCap(artist.marketCap)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">24h Volume</span>
                <span className="block font-medium text-gray-300">
                  {formatMarketCap(artist.volume24h)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 