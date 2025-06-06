import { NextResponse } from 'next/server';
import { ValuationService } from '@/services/valuationService';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const valuation = await ValuationService.calculateArtistValue(params.id);
    return NextResponse.json(valuation);
  } catch (error) {
    console.error('Error fetching artist valuation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist valuation' },
      { status: 500 }
    );
  }
} 