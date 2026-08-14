import { NextRequest, NextResponse } from 'next/server';
import { getTmdbUrl } from '@/lib/tmdb';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query');
  const genre = searchParams.get('genre');
  const page = searchParams.get('page') || '1';
  
  let endpoint = '';
  const params: Record<string, string> = { page, include_adult: 'false' };
  
  if (query) {
    endpoint = '/search/movie';
    params.query = query;
  } else if (genre) {
    endpoint = '/discover/movie';
    params.with_genres = genre;
    params.sort_by = 'popularity.desc';
  } else {
    endpoint = '/movie/popular';
  }
  
  try {
    const res = await fetch(getTmdbUrl(endpoint, params));
    if (!res.ok) throw new Error('Failed to fetch from TMDB');
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 });
  }
}
