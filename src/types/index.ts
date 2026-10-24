export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path?: string | null;
  vote_average: number;
  release_date: string;
  genre_ids: number[];
  overview: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  credits: {
    cast: Cast[];
  };
  videos: {
    results: Video[];
  };
}

export interface UserReview {
  id: string;
  movieId: number;
  movieTitle: string;
  moviePosterPath?: string | null;
  author: string;
  rating: number; // 1 to 5
  content: string;
  createdAt: string; // ISO string
}

export interface TmdbReview {
  id: string;
  author: string;
  content: string;
  created_at: string;
  url?: string;
  author_details?: {
    name?: string;
    username?: string;
    avatar_path?: string | null;
    rating?: number | null;
  };
}
