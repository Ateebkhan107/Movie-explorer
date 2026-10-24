import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey } from '@/lib/tmdb';
import { STATIC_TRIVIA_QUESTIONS, createQuestionsFromMovies, shuffleArray } from '@/lib/triviaData';
import { Movie } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countParam = parseInt(searchParams.get('count') || '10', 10);
  const count = Math.min(Math.max(countParam, 5), 20);

  // If TMDB key is not present, use curated static questions
  if (!hasTmdbKey()) {
    const questions = shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, count);
    return NextResponse.json({ questions, isFallback: true });
  }

  try {
    // Fetch random page from popular movies (pages 1-5 for variety)
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const res = await fetchTmdb('/movie/popular', { page: randomPage.toString() }, {
      timeoutMs: 4000,
      revalidate: 1800,
    });

    if (!res.ok) {
      const questions = shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, count);
      return NextResponse.json({ questions, isFallback: true });
    }

    const data = await res.json();
    const tmdbMovies: Movie[] = data.results || [];

    // Mix 5 curated static trivia questions with 5 dynamic questions for best variety
    const dynamicHalf = createQuestionsFromMovies(tmdbMovies, Math.ceil(count / 2));
    const staticHalf = shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, Math.floor(count / 2));

    const combined = shuffleArray([...dynamicHalf, ...staticHalf]);

    return NextResponse.json({ questions: combined });
  } catch (err) {
    console.warn('Trivia API error, falling back to static questions:', err);
    const questions = shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, count);
    return NextResponse.json({ questions, isFallback: true });
  }
}
