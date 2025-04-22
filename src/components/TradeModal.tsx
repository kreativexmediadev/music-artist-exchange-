import { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useArtistPrices } from '@/hooks/useArtistPrices'

interface TradeModalProps {
  isOpen: boolean
  onClose: () => void
  artist: {
    id: string
    name: string
    tokenSymbol: string
    currentPrice: number
  }
}

export function TradeModal({ isOpen, onClose, artist }: TradeModalProps) {
  const [type, setType] = useState<'BUY' | 'SELL'>('BUY')
  const [amount, setAmount] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()
  const { prices } = useArtistPrices([artist.id])

  const currentPrice = prices[artist.id]?.currentPrice || artist.currentPrice
  const totalValue = Number(amount) * currentPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) {
      router.push('/api/auth/signin')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/artists/${artist.id}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          price: currentPrice,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to place order')
      }

      onClose()
      router.refresh()
    } catch (error) {
      console.error('Error placing order:', error)
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Trade {artist.name} ({artist.tokenSymbol})
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div className="flex gap-4">
                    <button
                      type="button"
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        type === 'BUY'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setType('BUY')}
                    >
                      Buy
                    </button>
                    <button
                      type="button"
                      className={`flex-1 px-4 py-2 rounded-lg ${
                        type === 'SELL'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                      onClick={() => setType('SELL')}
                    >
                      Sell
                    </button>
                  </div>

                  <div>
                    <label
                      htmlFor="amount"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Amount
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        id="amount"
                        min="0"
                        step="0.000001"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Price per token</span>
                      <span className="font-medium">${currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Total value</span>
                      <span className="font-medium">${totalValue.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                        type === 'BUY'
                          ? 'bg-green-600 hover:bg-green-700 focus-visible:ring-green-500'
                          : 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                      }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Processing...' : `${type} ${artist.tokenSymbol}`}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
} 