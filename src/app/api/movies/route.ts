import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey, getFromMemCache, setMemCache } from '@/lib/tmdb';
import { FALLBACK_MOVIES } from '@/lib/fallbackData';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawQuery = searchParams.get('query');
  const rawGenre = searchParams.get('genre');
  const rawYear = searchParams.get('year');
  const rawPage = searchParams.get('page') || '1';

  const query = rawQuery?.trim() || '';
  const genre = rawGenre?.trim() || '';
  const year = rawYear?.trim() || '';

  const pageNum = parseInt(rawPage, 10);
  const page = !isNaN(pageNum) && pageNum > 0 ? pageNum.toString() : '1';

  // Construct cache key distinguishing all parameters
  const isSearch = Boolean(query);
  const isGenreFilter = Boolean(genre && /^\d+$/.test(genre));
  const isYearFilter = Boolean(year && /^\d{4}$/.test(year));

  const cacheTtl = isSearch ? 120 : 600; // 2 min for search, 10 min for popular/genre/year
  const cacheKey = `tmdb:movies:q=${encodeURIComponent(query)}:g=${genre}:y=${year}:p=${page}`;

  // Check in-memory cache first (0ms response)
  const cached = getFromMemCache<unknown>(cacheKey);
  if (cached) {
    return NextResponse.json(cached.data, {
      status: cached.status,
      headers: {
        'Cache-Control': isSearch
          ? 'public, s-maxage=120, stale-while-revalidate=300'
          : 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'HIT',
      },
    });
  }

  // Missing TMDB key handling
  if (!hasTmdbKey()) {
    let fallbackResults = FALLBACK_MOVIES;
    if (isGenreFilter) {
      const gId = parseInt(genre, 10);
      fallbackResults = fallbackResults.filter((m) => m.genre_ids.includes(gId));
    }
    if (isYearFilter) {
      fallbackResults = fallbackResults.filter((m) => m.release_date?.startsWith(year));
    }
    if (isSearch) {
      const qLower = query.toLowerCase();
      fallbackResults = fallbackResults.filter(
        (m) => m.title.toLowerCase().includes(qLower) || m.overview.toLowerCase().includes(qLower)
      );
    }

    return NextResponse.json(
      {
        page: 1,
        results: fallbackResults,
        total_pages: 1,
        total_results: fallbackResults.length,
        isFallback: true,
        isDegraded: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'X-Degraded': '1',
        },
      }
    );
  }

  let endpoint = '';
  const params: Record<string, string> = { page, include_adult: 'false' };

  if (isSearch) {
    endpoint = '/search/movie';
    params.query = query;
    if (isYearFilter) {
      params.primary_release_year = year;
    }
  } else if (isGenreFilter || isYearFilter) {
    endpoint = '/discover/movie';
    if (isGenreFilter) {
      params.with_genres = genre;
    }
    if (isYearFilter) {
      params.primary_release_year = year;
    }
    params.sort_by = 'popularity.desc';
  } else {
    endpoint = '/movie/popular';
  }

  try {
    const res = await fetchTmdb(endpoint, params, {
      revalidate: cacheTtl,
      timeoutMs: 5000,
    });

    if (!res.ok) {
      // If search or filter fails, return graceful empty list with error status
      if (isSearch || isGenreFilter || isYearFilter) {
        return NextResponse.json(
          { error: 'Failed to fetch movies from TMDB', isOffline: true, results: [], total_pages: 0, total_results: 0 },
          { status: res.status >= 400 && res.status < 500 ? res.status : 502 }
        );
      }

      // Default popular movies fallback when upstream service is down
      return NextResponse.json(
        {
          page: 1,
          results: FALLBACK_MOVIES,
          total_pages: 1,
          total_results: FALLBACK_MOVIES.length,
          isFallback: true,
          isDegraded: true,
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
            'X-Degraded': '1',
          },
        }
      );
    }

    const data = await res.json();
    setMemCache(cacheKey, data, 200, cacheTtl);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': isSearch
          ? 'public, s-maxage=120, stale-while-revalidate=300'
          : 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.warn('TMDB movies request error:', error);

    if (isSearch || isGenreFilter || isYearFilter) {
      return NextResponse.json(
        {
          error: 'Movie search service is temporarily unavailable. Please try again.',
          isOffline: true,
          results: [],
          total_pages: 0,
          total_results: 0,
        },
        { status: 503 }
      );
    }

    // Default popular movies: return degraded sample set with indicator
    return NextResponse.json(
      {
        page: 1,
        results: FALLBACK_MOVIES,
        total_pages: 1,
        total_results: FALLBACK_MOVIES.length,
        isFallback: true,
        isDegraded: true,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
          'X-Degraded': '1',
        },
      }
    );
  }
}
