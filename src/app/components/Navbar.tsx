'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navbar() {
  const [balance] = useState('100,000.00') // This will be replaced with real balance data
  
  return (
    <nav className="navbar">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-[#ffc600]">MAX</span>
              <span className="ml-2 text-gray-400">Music Artist Exchange</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex space-x-8">
              <Link href="/market" className="text-gray-300 hover:text-[#ffc600] transition-colors">
                Market
              </Link>
              <Link href="/portfolio" className="text-gray-300 hover:text-[#ffc600] transition-colors">
                Portfolio
              </Link>
              <Link href="/orders" className="text-gray-300 hover:text-[#ffc600] transition-colors">
                Orders
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm bg-[#232b3d] px-4 py-2 rounded-lg">
                <span className="text-gray-400">Balance:</span>
                <span className="ml-2 font-semibold text-[#ffc600]">${balance}</span>
              </div>
              <button className="btn-primary">
                Deposit
              </button>
              <div className="w-8 h-8 bg-[#232b3d] rounded-full flex items-center justify-center">
                <span className="text-[#ffc600] font-semibold">U</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 