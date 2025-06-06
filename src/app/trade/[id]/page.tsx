import { prisma } from '@/lib/prisma';
import { ArtistValuation } from '@/components/ArtistValuation';
import { OrderBook } from '@/components/OrderBook';
import { TradeForm } from '@/components/TradeForm';
import { notFound } from 'next/navigation';

async function getArtist(id: string) {
  const artist = await prisma.artist.findUnique({
    where: { id },
    include: {
      metrics: {
        include: {
          social: true,
          financial: true,
          technical: true,
        },
      },
    },
  });

  if (!artist) notFound();
  return artist;
}

export default async function TradePage({ params }: { params: { id: string } }) {
  const artist = await getArtist(params.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Artist Info & Valuation */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              {artist.imageUrl && (
                <img 
                  src={artist.imageUrl} 
                  alt={artist.name} 
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold">{artist.name}</h1>
                <p className="text-gray-500">{artist.tokenSymbol}</p>
              </div>
            </div>
            
            <ArtistValuation artistId={artist.id} />
          </div>

          {/* Technical Analysis */}
          {artist.metrics?.technical && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Technical Analysis</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">RSI</p>
                  <p className="text-lg font-semibold">{artist.metrics.technical.rsi.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">MACD</p>
                  <p className="text-lg font-semibold">{artist.metrics.technical.macd.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">50D MA</p>
                  <p className="text-lg font-semibold">{artist.metrics.technical.movingAverage50d.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">200D MA</p>
                  <p className="text-lg font-semibold">{artist.metrics.technical.movingAverage200d.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Trading Interface */}
        <div className="space-y-6">
          <TradeForm artistId={artist.id} />
          <OrderBook artistId={artist.id} />
        </div>
      </div>

      {/* Bottom Section - Additional Metrics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Social Metrics */}
        {artist.metrics?.social && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Social Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Monthly Listeners</span>
                <span className="font-semibold">{artist.metrics.social.monthlyListeners.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Spotify Followers</span>
                <span className="font-semibold">{artist.metrics.social.spotifyFollowers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Instagram Engagement</span>
                <span className="font-semibold">{artist.metrics.social.instagramEngagement.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        )}

        {/* Financial Metrics */}
        {artist.metrics?.financial && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Financial Metrics</h2>
            <div className="space-y-4">
              <h3 className="text-sm text-gray-500">Revenue Streams</h3>
              {(artist.metrics.financial.revenueStreams as any[]).map((stream, index) => (
                <div key={index} className="flex justify-between">
                  <span>{stream.source}</span>
                  <span className="font-semibold">{stream.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Market Sentiment */}
        {artist.metrics?.technical && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Market Sentiment</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Overall Sentiment</span>
                <span className="font-semibold">{artist.metrics.technical.sentimentOverall}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Sentiment Score</span>
                <span className="font-semibold">{artist.metrics.technical.sentimentScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">News Mentions (30d)</span>
                <span className="font-semibold">{artist.metrics.technical.newsCount30d}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Social Mentions (30d)</span>
                <span className="font-semibold">{artist.metrics.technical.socialMentions30d}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 