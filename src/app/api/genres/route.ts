import { NextResponse } from 'next/server';
import { getTmdbUrl } from '@/lib/tmdb';

export async function GET() {
  try {
    const res = await fetch(getTmdbUrl('/genre/movie/list'));
    if (!res.ok) throw new Error('Failed to fetch genres from TMDB');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch genres' }, { status: 500 });
  }
}
