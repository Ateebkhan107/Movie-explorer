'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useReviews } from '@/context/ReviewsContext';
import MovieDetailModal from '@/components/MovieDetailModal';
import StarRating from '@/components/StarRating';
import { getTmdbImageUrl } from '@/lib/tmdb';
import { Movie } from '@/types';
import { Star, MessageSquare, Trash2, Film, ArrowRight } from 'lucide-react';

export default function ReviewsPage() {
  const { reviews, deleteReview } = useReviews();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenMovie = (movieId: number, title: string, posterPath?: string | null) => {
    setSelectedMovieId(movieId);
    setSelectedMovie({
      id: movieId,
      title,
      poster_path: posterPath || null,
      vote_average: 0,
      release_date: '',
      genre_ids: [],
      overview: '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedMovie(null);
      setSelectedMovieId(null);
    }, 300);
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full border border-amber-500/30">
            <Star className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              My Ratings & Reviews
            </h1>
            <p className="text-white/70 text-sm sm:text-base mt-0.5">
              Films you rated and shared thoughts on ({reviews.length})
            </p>
          </div>
        </div>

        {reviews.length > 0 && averageRating && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 shrink-0">
            <div className="text-right">
              <span className="text-xs text-gray-300 block">Avg. Given Rating</span>
              <span className="text-lg font-bold text-amber-400">{averageRating} / 5.0</span>
            </div>
            <StarRating rating={Math.round(Number(averageRating))} size="sm" />
          </div>
        )}
      </div>

      {/* Content */}
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/20 max-w-md mx-auto shadow-2xl">
            <span className="text-4xl mb-4 block">⭐</span>
            <h2 className="text-xl font-semibold mb-2 text-white">No Reviews Yet</h2>
            <p className="text-white/70 mb-6 text-sm">
              You haven&apos;t rated or reviewed any films yet. Click on any movie card to share your rating and review!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Film className="w-4 h-4" />
              Explore Movies
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 flex flex-col justify-between shadow-xl hover:border-white/40 transition-all group"
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div
                    onClick={() => handleOpenMovie(rev.movieId, rev.movieTitle, rev.moviePosterPath)}
                    className="relative w-16 h-24 rounded-xl overflow-hidden bg-gray-900 border border-white/10 shrink-0 cursor-pointer shadow-md group-hover:scale-105 transition-transform"
                  >
                    <Image
                      src={
                        rev.moviePosterPath
                          ? getTmdbImageUrl(rev.moviePosterPath, 'w185')
                          : 'https://via.placeholder.com/154x231/1e1b4b/ffffff?text=No+Poster'
                      }
                      alt={rev.movieTitle}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3
                      onClick={() => handleOpenMovie(rev.movieId, rev.movieTitle, rev.moviePosterPath)}
                      className="font-bold text-lg text-white hover:text-indigo-300 transition-colors cursor-pointer truncate"
                    >
                      {rev.movieTitle}
                    </h3>
                    <div className="mt-1">
                      <StarRating rating={rev.rating} size="sm" showLabel={true} />
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {rev.content ? (
                  <p className="text-gray-200 text-sm leading-relaxed line-clamp-4 italic bg-black/20 p-3 rounded-xl border border-white/5">
                    &ldquo;{rev.content}&rdquo;
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs italic bg-black/20 p-3 rounded-xl border border-white/5">
                    Quick rated {rev.rating} of 5 stars (no review text added).
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs">
                <button
                  onClick={() => handleOpenMovie(rev.movieId, rev.movieTitle, rev.moviePosterPath)}
                  className="flex items-center gap-1 text-indigo-300 hover:text-white font-medium transition-colors"
                >
                  <span>View & Edit</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => deleteReview(rev.id)}
                  aria-label={`Delete review for ${rev.movieTitle}`}
                  className="p-1.5 text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Movie Detail Modal */}
      <MovieDetailModal
        isOpen={isModalOpen}
        movieId={selectedMovieId}
        movie={selectedMovie}
        onClose={handleCloseModal}
        onMovieSelect={(m) => {
          setSelectedMovie(m);
          setSelectedMovieId(m.id);
        }}
      />
    </div>
  );
}
