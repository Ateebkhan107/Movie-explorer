import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey, getFromMemCache, setMemCache } from '@/lib/tmdb';
import { TmdbReview } from '@/types';

const CACHE_TTL_SECONDS = 3600; // 1 hour

const SAMPLE_REVIEWS: Record<number, TmdbReview[]> = {
  550: [
    {
      id: 'rev-sample-1',
      author: 'CinemaFanatic',
      content: 'A groundbreaking masterpiece on modern alienation and consumerism. Fincher at his absolute peak with mindblowing performances from Pitt and Norton.',
      created_at: '2023-01-15T12:00:00.000Z',
      author_details: { rating: 10, username: 'cinemafan' },
    },
    {
      id: 'rev-sample-2',
      author: 'FilmBuff99',
      content: 'The twist, the cinematography, the Dust Brothers soundtrack—everything comes together seamlessly. Essential viewing.',
      created_at: '2023-06-20T08:30:00.000Z',
      author_details: { rating: 9, username: 'filmbuff' },
    },
  ],
  27205: [
    {
      id: 'rev-sample-3',
      author: 'DreamWeaver',
      content: 'Christopher Nolan crafted an intricate puzzle box that never sacrifices emotional resonance. Hans Zimmer score gives you goosebumps throughout.',
      created_at: '2023-04-10T14:15:00.000Z',
      author_details: { rating: 10, username: 'dreamer' },
    },
  ],
  155: [
    {
      id: 'rev-sample-4',
      author: 'GothamCritic',
      content: 'Heath Ledger Joker remains the gold standard for cinematic villains. A gripping crime epic that transcends the superhero genre completely.',
      created_at: '2023-09-05T19:00:00.000Z',
      author_details: { rating: 10, username: 'gothamite' },
    },
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || !/^\d+$/.test(id)) {
    return NextResponse.json({ error: 'Invalid movie ID' }, { status: 400 });
  }

  const cacheKey = `tmdb:reviews:${id}`;
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
  const fallbackList = SAMPLE_REVIEWS[idNum] || [];

  if (!hasTmdbKey()) {
    return NextResponse.json({
      page: 1,
      results: fallbackList,
      total_pages: 1,
      total_results: fallbackList.length,
      isFallback: true,
    });
  }

  try {
    const res = await fetchTmdb(`/movie/${id}/reviews`, {}, {
      revalidate: CACHE_TTL_SECONDS,
      timeoutMs: 4000,
    });

    if (!res.ok) {
      return NextResponse.json({
        page: 1,
        results: fallbackList,
        total_pages: 1,
        total_results: fallbackList.length,
      });
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
    console.warn(`TMDB reviews error for id ${id}:`, error);
    return NextResponse.json({
      page: 1,
      results: fallbackList,
      total_pages: 1,
      total_results: fallbackList.length,
    });
  }
}
