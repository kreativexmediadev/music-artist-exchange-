'use client'

import { useState } from 'react'
import TradingViewChart from './components/TradingViewChart'
import OrderBook from './components/OrderBook'
import ArtistList from './components/ArtistList'
import TradeForm from './components/TradeForm'
import Navbar from './components/Navbar'

export default function Home() {
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null)

  return (
    <div className="flex flex-col h-screen">
      <Navbar />
      
      <div className="trading-grid p-4">
        {/* Left sidebar - Artist List */}
        <div className="overflow-y-auto">
          <ArtistList 
            onSelectArtist={setSelectedArtist}
            selectedArtist={selectedArtist}
          />
        </div>

        {/* Main content - Trading Chart */}
        <div className="flex flex-col gap-4">
          <div className="card h-[600px]">
            <TradingViewChart artistId={selectedArtist} />
          </div>
          <div className="card flex-1">
            <TradeForm artistId={selectedArtist} />
          </div>
        </div>

        {/* Right sidebar - Order Book */}
        <div className="overflow-y-auto">
          <OrderBook artistId={selectedArtist} />
        </div>
      </div>
    </div>
  )
} 