import { NextRequest, NextResponse } from 'next/server';
import { getTmdbUrl } from '@/lib/tmdb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const res = await fetch(getTmdbUrl(`/movie/${resolvedParams.id}/similar`));
    if (!res.ok) throw new Error('Failed to fetch similar movies from TMDB');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch similar movies' }, { status: 500 });
  }
}
