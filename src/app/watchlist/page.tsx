'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWatchlist } from '@/context/WatchlistContext';
import MovieGrid from '@/components/MovieGrid';
import MovieDetailModal from '@/components/MovieDetailModal';
import { Movie } from '@/types';
import { Heart, Compass } from 'lucide-react';

export default function WatchlistPage() {
  const { watchlist } = useWatchlist();
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-500/20 text-rose-500 rounded-full border border-rose-500/30">
          <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">My Watchlist</h1>
          <p className="text-white/70 text-sm sm:text-base mt-0.5">Movies you want to watch later ({watchlist.length})</p>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-md mx-auto">
            <span className="text-4xl mb-4 block">🎬</span>
            <h2 className="text-xl font-semibold mb-2 text-white">Your Watchlist is Empty</h2>
            <p className="text-white/70 mb-6 text-sm">
              You haven&apos;t added any movies to your watchlist yet. Go discover and swipe to save films!
            </p>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-full font-medium text-sm transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
            >
              <Compass className="w-4 h-4" />
              Discover Movies
            </Link>
          </div>
        </div>
      ) : (
        <MovieGrid 
          movies={watchlist} 
          isLoading={false} 
          onMovieClick={handleMovieSelect}
        />
      )}

      <MovieDetailModal 
        isOpen={isModalOpen}
        movieId={selectedMovie?.id || null}
        movie={selectedMovie}
        onClose={handleCloseModal}
        onMovieSelect={handleMovieSelect}
      />
    </div>
  );
}
