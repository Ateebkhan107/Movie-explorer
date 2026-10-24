import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey, getFromMemCache, setMemCache } from '@/lib/tmdb';
import { FALLBACK_DETAILS, FALLBACK_MOVIES } from '@/lib/fallbackData';
import { MovieDetails } from '@/types';

const CACHE_TTL_SECONDS = 3600; // 1 hour

function getFallbackMovieDetail(idNum: number): MovieDetails | null {
  if (FALLBACK_DETAILS[idNum]) {
    return FALLBACK_DETAILS[idNum];
  }
  const movie = FALLBACK_MOVIES.find((m) => m.id === idNum);
  if (movie) {
    return {
      ...movie,
      runtime: 120,
      genres: [],
      credits: { cast: [] },
      videos: { results: [] },
    };
  }
  return null;
}

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

  const cacheKey = `tmdb:movie:${id}`;
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

  const idNum = parseInt(id, 10);
  const fallback = getFallbackMovieDetail(idNum);

  if (!hasTmdbKey()) {
    if (fallback) {
      return NextResponse.json(
        { ...fallback, isFallback: true, isDegraded: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            'X-Degraded': '1',
          },
        }
      );
    }
    return NextResponse.json({ error: 'Movie details not available' }, { status: 404 });
  }

  try {
    const res = await fetchTmdb(
      `/movie/${id}`,
      { append_to_response: 'credits,videos' },
      { revalidate: CACHE_TTL_SECONDS, timeoutMs: 5000 }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
      }
      if (fallback) {
        return NextResponse.json(
          { ...fallback, isFallback: true, isDegraded: true },
          {
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
              'X-Degraded': '1',
            },
          }
        );
      }
      return NextResponse.json(
        { error: 'Failed to fetch movie details from TMDB', isOffline: true },
        { status: res.status >= 400 && res.status < 500 ? res.status : 502 }
      );
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
    console.warn(`TMDB movie detail error for id ${id}:`, error);
    if (fallback) {
      return NextResponse.json(
        { ...fallback, isFallback: true, isDegraded: true },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            'X-Degraded': '1',
          },
        }
      );
    }
    return NextResponse.json(
      { error: 'Movie detail service temporarily unavailable', isOffline: true },
      { status: 503 }
    );
  }
}
