'use client';

import { useState } from 'react';
import { useWatchlist } from '@/context/WatchlistContext';
import MovieGrid from '@/components/MovieGrid';
import MovieDetailModal from '@/components/MovieDetailModal';
import { Movie } from '@/types';
import { Heart } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-rose-500/20 text-rose-500 rounded-full border border-rose-500/30">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">My Watchlist</h1>
          <p className="text-white/70 mt-1">Movies you want to watch later ({watchlist.length})</p>
        </div>
      </div>

      <MovieGrid 
        movies={watchlist} 
        isLoading={false} 
        onMovieClick={handleMovieSelect}
        emptyMessage="You haven't added any movies to your watchlist yet. Go discover some!"
      />

      <MovieDetailModal 
        isOpen={isModalOpen}
        movieId={selectedMovie?.id || null}
        onClose={handleCloseModal}
        onMovieSelect={handleMovieSelect}
      />
    </div>
  );
}
