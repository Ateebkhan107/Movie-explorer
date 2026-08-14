'use client';

import { Movie } from '@/types';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';
import { motion, AnimatePresence } from 'framer-motion';

interface MovieGridProps {
  movies: Movie[];
  isLoading: boolean;
  onMovieClick: (movie: Movie) => void;
  emptyMessage?: string;
}

export default function MovieGrid({ 
  movies, 
  isLoading, 
  onMovieClick,
  emptyMessage = "No movies found." 
}: MovieGridProps) {
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
        >
          <span className="text-4xl mb-4 block">🎬</span>
          <h3 className="text-xl font-semibold mb-2">No Movies Found</h3>
          <p className="text-white/70">{emptyMessage}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      <AnimatePresence mode="popLayout">
        {movies.map((movie, index) => (
          <MovieCard 
            key={movie.id} 
            movie={movie} 
            index={index} 
            onClick={onMovieClick} 
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
