import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey, getFromMemCache, setMemCache } from '@/lib/tmdb';

const CACHE_TTL_SECONDS = 3600; // 1 hour

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json(
      { error: 'Invalid movie ID' },
      { status: 400 }
    );
  }

  const cacheKey = `tmdb:similar:${id}`;
  const cached = getFromMemCache<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache': 'HIT',
      },
    });
  }

  if (!hasTmdbKey()) {
    return NextResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
  }

  try {
    const res = await fetchTmdb(`/movie/${id}/similar`, {}, {
      revalidate: CACHE_TTL_SECONDS,
      timeoutMs: 5000,
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
      }
      return NextResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
    }

    const data = await res.json();
    setMemCache(cacheKey, data, 200, CACHE_TTL_SECONDS);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.warn(`TMDB similar movies error for id ${id}:`, error);
    return NextResponse.json({ page: 1, results: [], total_pages: 0, total_results: 0 });
  }
}
