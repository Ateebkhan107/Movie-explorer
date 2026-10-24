import { NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey, getFromMemCache, setMemCache } from '@/lib/tmdb';
import { FALLBACK_GENRES } from '@/lib/fallbackData';

const CACHE_KEY = 'tmdb:genres';
const CACHE_TTL_SECONDS = 86400; // 24 hours

export async function GET() {
  // Check fast in-memory cache
  const cached = getFromMemCache<{ genres: unknown[] }>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        'X-Cache': 'HIT',
      },
    });
  }

  if (!hasTmdbKey()) {
    return NextResponse.json(
      { genres: FALLBACK_GENRES, isFallback: true },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          'X-Degraded': '1',
        },
      }
    );
  }

  try {
    const res = await fetchTmdb('/genre/movie/list', {}, { revalidate: CACHE_TTL_SECONDS });
    if (!res.ok) {
      return NextResponse.json(
        { genres: FALLBACK_GENRES, isFallback: true },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Degraded': '1',
          },
        }
      );
    }
    const data = await res.json();
    setMemCache(CACHE_KEY, data, 200, CACHE_TTL_SECONDS);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=86400',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.warn('TMDB genre fetch failed, using fallback genres:', error);
    return NextResponse.json(
      { genres: FALLBACK_GENRES, isFallback: true },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Degraded': '1',
        },
      }
    );
  }
}
