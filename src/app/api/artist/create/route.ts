import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { CreateArtistInput } from '@/types/artist';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize rate limiter
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
});

// Validation error type
interface ValidationError {
  field: string;
  message: string;
}

// Validate artist data
function validateArtistData(data: CreateArtistInput): ValidationError[] {
  const errors: ValidationError[] = [];

  // Required fields
  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: 'Artist name is required' });
  } else if (data.name.length < 2) {
    errors.push({ field: 'name', message: 'Artist name must be at least 2 characters' });
  } else if (data.name.length > 50) {
    errors.push({ field: 'name', message: 'Artist name must be less than 50 characters' });
  }

  if (!data.bio?.trim()) {
    errors.push({ field: 'bio', message: 'Bio is required' });
  } else if (data.bio.length < 10) {
    errors.push({ field: 'bio', message: 'Bio must be at least 10 characters' });
  } else if (data.bio.length > 1000) {
    errors.push({ field: 'bio', message: 'Bio must be less than 1000 characters' });
  }

  if (!data.genre?.trim()) {
    errors.push({ field: 'genre', message: 'Genre is required' });
  }

  if (!data.image?.trim()) {
    errors.push({ field: 'image', message: 'Image URL is required' });
  } else if (!isValidUrl(data.image)) {
    errors.push({ field: 'image', message: 'Invalid image URL format' });
  }

  // Validate social links if provided
  if (data.socialLinks) {
    Object.entries(data.socialLinks).forEach(([platform, url]) => {
      if (url && !isValidUrl(url)) {
        errors.push({ field: `social.${platform}`, message: `Invalid ${platform} URL format` });
      }
    });
  }

  return errors;
}

// URL validation helper
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          message: 'Too many requests',
          limit,
          reset,
          remaining,
        },
        { status: 429 }
      );
    }

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request data
    const data: CreateArtistInput = await req.json();
    const validationErrors = validateArtistData(data);

    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          message: 'Validation failed',
          errors: validationErrors,
        },
        { status: 400 }
      );
    }

    // Get user ID from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'User account not found' },
        { status: 404 }
      );
    }

    // Check if user already has an artist profile
    const existingArtist = await prisma.artist.findFirst({
      where: { userId: user.id },
    });

    if (existingArtist) {
      return NextResponse.json(
        { message: 'Artist profile already exists for this user' },
        { status: 409 }
      );
    }

    // Create artist profile within a transaction
    const artist = await prisma.$transaction(async (tx) => {
      // Create the artist profile
      const newArtist = await tx.artist.create({
        data: {
          userId: user.id,
          name: data.name.trim(),
          bio: data.bio.trim(),
          image: data.image.trim(),
          genre: data.genre.trim(),
          socialLinks: data.socialLinks,
          tokenSupply: 1000,
          tokensSold: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Create initial portfolio entry for the artist
      await tx.portfolio.create({
        data: {
          userId: user.id,
          artistId: newArtist.id,
          amount: 0,
        },
      });

      return newArtist;
    });

    return NextResponse.json(
      {
        message: 'Artist profile created successfully',
        artist,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating artist:', error);

    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { message: 'An artist with this name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        message: 'Failed to create artist profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    );
  }
} 