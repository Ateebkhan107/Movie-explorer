'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useWatchlist } from '@/context/WatchlistContext';
import { Heart, X, RotateCw, Compass } from 'lucide-react';
import { IMG_BASE } from '@/lib/tmdb';
import MovieDetailModal from '@/components/MovieDetailModal';

export default function DiscoverPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToWatchlist } = useWatchlist();

  const fetchDiscoverMovies = async () => {
    setIsLoading(true);
    try {
      // Get trending or popular
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        // Randomize the order a bit for discover feel
        const shuffled = (data.results || []).sort(() => 0.5 - Math.random());
        setMovies(shuffled);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscoverMovies();
  }, []);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  
  const currentMovie = movies[currentIndex];
  
  const handleDragEnd = (event: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 100 || velocity > 500) {
      handleSwipeRight();
    } else if (offset < -100 || velocity < -500) {
      handleSwipeLeft();
    }
  };

  const handleSwipeRight = () => {
    if (currentMovie) addToWatchlist(currentMovie);
    nextMovie();
  };

  const handleSwipeLeft = () => {
    nextMovie();
  };

  const nextMovie = () => {
    setCurrentIndex((prev) => prev + 1);
  };

  const openDetails = () => {
    if (currentMovie) {
      setSelectedMovie(currentMovie);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 overflow-hidden relative min-h-[calc(100vh-64px)]">
      
      {/* Background decorations */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse" />
      
      <div className="text-center mb-8 z-10">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Compass className="w-8 h-8 text-fuchsia-400" />
          Discover
        </h1>
        <p className="text-white/70 mt-2">Swipe right to save, left to skip</p>
      </div>

      <div className="relative w-full max-w-sm h-[500px] sm:h-[600px] flex items-center justify-center z-20">
        {isLoading ? (
          <div className="w-16 h-16 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        ) : currentIndex >= movies.length ? (
          <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
            <span className="text-5xl mb-4 block">🎉</span>
            <h2 className="text-2xl font-bold text-white mb-2">You've seen them all!</h2>
            <p className="text-white/70 mb-6">Check your watchlist or reshuffle for more.</p>
            <button
              onClick={fetchDiscoverMovies}
              className="flex items-center gap-2 mx-auto bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-fuchsia-500/50 hover:-translate-y-1"
            >
              <RotateCw className="w-5 h-5" />
              Reshuffle
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              key={currentMovie.id}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              style={{ x, rotate, opacity }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              whileDrag={{ scale: 1.05 }}
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.2 } }}
            >
              <div 
                className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-white/20 group"
                onClick={openDetails}
              >
                <img
                  src={currentMovie.poster_path ? `${IMG_BASE}${currentMovie.poster_path}` : 'https://via.placeholder.com/600x900/1a202c/ffffff?text=No+Image'}
                  alt={currentMovie.title}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
                
                <div className="absolute bottom-0 left-0 w-full p-6 text-white pointer-events-none">
                  <h2 className="text-2xl font-bold mb-2 drop-shadow-md">{currentMovie.title}</h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full backdrop-blur-md border border-yellow-400/30">
                      ★ {currentMovie.vote_average?.toFixed(1)}
                    </span>
                    <span className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-md border border-white/30">
                      {currentMovie.release_date?.substring(0, 4)}
                    </span>
                  </div>
                  <p className="mt-3 text-gray-300 line-clamp-3 text-sm font-light">
                    {currentMovie.overview}
                  </p>
                </div>
                
                {/* Visual feedback overlays during drag could be added here mapped to x value */}
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {!isLoading && currentIndex < movies.length && (
        <div className="flex items-center justify-center gap-8 mt-10 z-20">
          <button
            onClick={handleSwipeLeft}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-rose-500/20 backdrop-blur-md flex items-center justify-center text-rose-500 border border-rose-500/30 hover:border-rose-500 transition-all hover:scale-110 shadow-lg"
          >
            <X className="w-8 h-8" />
          </button>
          
          <div className="text-white/50 text-sm font-medium tracking-widest uppercase">
            {movies.length - currentIndex} left
          </div>
          
          <button
            onClick={handleSwipeRight}
            className="w-16 h-16 rounded-full bg-white/10 hover:bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-emerald-500 border border-emerald-500/30 hover:border-emerald-500 transition-all hover:scale-110 shadow-lg"
          >
            <Heart className="w-8 h-8 fill-current" />
          </button>
        </div>
      )}

      <MovieDetailModal 
        isOpen={isModalOpen}
        movieId={selectedMovie?.id || null}
        onClose={() => setIsModalOpen(false)}
        onMovieSelect={(movie) => {
          setSelectedMovie(movie);
        }}
      />
    </div>
  );
}
