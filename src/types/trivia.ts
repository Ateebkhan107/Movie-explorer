export type TriviaClueType = 'blurry_poster' | 'tagline' | 'plot' | 'cast';

export interface TriviaQuestion {
  id: string;
  movieId: number;
  title: string;
  posterPath: string;
  releaseYear: string;
  genres: string[];
  clueType: TriviaClueType;
  clueText: string;
  castClues?: string[];
  options: string[];
  correctAnswer: string;
  funFact: string;
}

export interface TriviaRoundSummary {
  score: number;
  totalQuestions: number;
  correctCount: number;
  highestStreak: number;
  missedMovies: Array<{ id: number; title: string; posterPath: string }>;
  rankTitle: string;
}
