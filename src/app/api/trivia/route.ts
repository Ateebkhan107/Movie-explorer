import { NextRequest, NextResponse } from 'next/server';
import { fetchTmdb, hasTmdbKey } from '@/lib/tmdb';
import { STATIC_TRIVIA_QUESTIONS, createQuestionsFromMovies, shuffleArray } from '@/lib/triviaData';
import { Movie } from '@/types';
import { TriviaQuestion } from '@/types/trivia';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const countParam = parseInt(searchParams.get('count') || '10', 10);
  const mode = searchParams.get('mode') || 'mixed';
  const count = Math.min(Math.max(countParam, 5), 20);

  function applyMode(questions: TriviaQuestion[]): TriviaQuestion[] {
    if (mode === 'blurry_poster') {
      return questions.map((q) => ({
        ...q,
        clueType: 'blurry_poster',
        clueText: `Released in ${q.releaseYear}. Guess the movie from the unblurring poster!`,
      }));
    }
    if (mode === 'quotes') {
      return questions.filter((q) => q.clueType === 'tagline' || q.clueType === 'plot');
    }
    return questions;
  }

  // If TMDB key is not present, use curated static questions
  if (!hasTmdbKey()) {
    const pool = applyMode(STATIC_TRIVIA_QUESTIONS);
    const questions = shuffleArray(pool).slice(0, count);
    return NextResponse.json({ questions, isFallback: true });
  }

  try {
    const randomPage = Math.floor(Math.random() * 5) + 1;
    const res = await fetchTmdb('/movie/popular', { page: randomPage.toString() }, {
      timeoutMs: 4000,
      revalidate: 1800,
    });

    if (!res.ok) {
      const pool = applyMode(STATIC_TRIVIA_QUESTIONS);
      const questions = shuffleArray(pool).slice(0, count);
      return NextResponse.json({ questions, isFallback: true });
    }

    const data = await res.json();
    const tmdbMovies: Movie[] = data.results || [];

    const dynamicHalf = createQuestionsFromMovies(tmdbMovies, Math.ceil(count / 2));
    const staticHalf = shuffleArray(STATIC_TRIVIA_QUESTIONS).slice(0, Math.floor(count / 2));

    const combined = applyMode(shuffleArray([...dynamicHalf, ...staticHalf]));
    const questions = combined.slice(0, count);

    return NextResponse.json({ questions });
  } catch (err) {
    console.warn('Trivia API error, falling back to static questions:', err);
    const pool = applyMode(STATIC_TRIVIA_QUESTIONS);
    const questions = shuffleArray(pool).slice(0, count);
    return NextResponse.json({ questions, isFallback: true });
  }
}
