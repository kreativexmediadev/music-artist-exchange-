import { NextResponse } from 'next/server';
import { Artist } from '@/services/artistService';
import { prisma } from '@/lib/prisma';

const VALID_SORT_FIELDS = [
  'marketCap',
  'currentPrice',
  'priceChange24h',
  'monthlyListeners',
] as const;

type SortField = typeof VALID_SORT_FIELDS[number];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const genre = searchParams.get('genre');
    const sortBy = (searchParams.get('sortBy') || 'marketCap') as SortField;
    const sortDirection = (searchParams.get('sortDirection') || 'desc') as 'asc' | 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '12');

    // Validate sort field
    if (!VALID_SORT_FIELDS.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${VALID_SORT_FIELDS.join(', ')}` },
        { status: 400 }
      );
    }

    // Calculate skip for pagination
    const skip = (page - 1) * pageSize;

    // Build where clause for filtering
    const where = {
      AND: [
        search ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { tokenSymbol: { contains: search, mode: 'insensitive' } },
          ],
        } : {},
        genre ? { genre } : {},
      ],
    };

    // Build order by clause based on sort field
    let orderBy: any = {};
    if (sortBy === 'monthlyListeners') {
      orderBy = {
        metrics: {
          social: {
            monthlyListeners: sortDirection,
          },
        },
      };
    } else {
      orderBy[sortBy] = sortDirection;
    }

    // Fetch artists with filters and pagination
    const [artists, total] = await Promise.all([
      prisma.artist.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        include: {
          metrics: {
            include: {
              social: true,
            },
          },
        },
      }),
      prisma.artist.count({ where }),
    ]);

    // Transform data to match frontend interface
    const transformedArtists: Artist[] = artists.map(artist => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.imageUrl,
      genre: artist.genre,
      tokenSymbol: artist.tokenSymbol,
      currentPrice: artist.currentPrice,
      priceChange24h: artist.priceChange24h,
      marketCap: artist.marketCap,
      monthlyListeners: artist.metrics?.social?.monthlyListeners ?? 0,
      verified: artist.verified,
      socialMetrics: {
        spotify: {
          monthlyListeners: artist.metrics?.social?.monthlyListeners ?? 0,
          followers: artist.metrics?.social?.spotifyFollowers ?? 0,
          topTracks: artist.metrics?.social?.topTracks ?? [],
        },
        instagram: {
          followers: artist.metrics?.social?.instagramFollowers ?? 0,
          engagement: artist.metrics?.social?.instagramEngagement ?? 0,
          posts30d: artist.metrics?.social?.instagramPosts30d ?? 0,
        },
        twitter: {
          followers: artist.metrics?.social?.twitterFollowers ?? 0,
          engagement: artist.metrics?.social?.twitterEngagement ?? 0,
          tweets30d: artist.metrics?.social?.twitterPosts30d ?? 0,
        },
      },
      financialMetrics: {
        revenueStreams: artist.metrics?.financial?.revenueStreams ?? [],
        quarterlyRevenue: artist.metrics?.financial?.quarterlyRevenue ?? [],
      },
      analysis: {
        technicalIndicators: {
          rsi: artist.metrics?.technical?.rsi ?? 0,
          macd: artist.metrics?.technical?.macd ?? 0,
          movingAverage50d: artist.metrics?.technical?.movingAverage50d ?? 0,
          movingAverage200d: artist.metrics?.technical?.movingAverage200d ?? 0,
        },
        marketSentiment: {
          overall: artist.metrics?.technical?.sentimentOverall ?? 'neutral',
          score: artist.metrics?.technical?.sentimentScore ?? 0,
          newsCount30d: artist.metrics?.technical?.newsCount30d ?? 0,
          socialMentions30d: artist.metrics?.technical?.socialMentions30d ?? 0,
        },
      },
    }));

    return NextResponse.json({
      artists: transformedArtists,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 