'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/types';
import {
  motion,
  useMotionValue,
  useTransform,
  AnimatePresence,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion';
import { useWatchlist } from '@/context/WatchlistContext';
import { Heart, X, RotateCw, Compass } from 'lucide-react';
import { getTmdbImageUrl } from '@/lib/tmdb';
import MovieDetailModal from '@/components/MovieDetailModal';
import Image from 'next/image';

export default function DiscoverPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToWatchlist } = useWatchlist();
  const shouldReduceMotion = useReducedMotion();

  const loadMovies = useCallback(async () => {
    try {
      const res = await fetch('/api/movies');
      if (res.ok) {
        const data = await res.json();
        const shuffled = (data.results || []).sort(() => 0.5 - Math.random());
        setMovies(shuffled);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch('/api/movies');
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            const shuffled = (data.results || []).sort(() => 0.5 - Math.random());
            setMovies(shuffled);
            setCurrentIndex(0);
          }
        }
      } catch (error) {
        if (!ignore) console.error('Failed to fetch movies:', error);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  const handleReshuffle = () => {
    setIsLoading(true);
    loadMovies();
  };

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], shouldReduceMotion ? [0, 0] : [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const currentMovie = movies[currentIndex];
  const nextMovie = movies[currentIndex + 1];
  const upcomingMovie = movies[currentIndex + 2];

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > 90 || velocity > 450) {
      handleSwipeRight();
    } else if (offset < -90 || velocity < -450) {
      handleSwipeLeft();
    }
  };

  const handleSwipeRight = () => {
    if (currentMovie) addToWatchlist(currentMovie);
    nextMovieCard();
  };

  const handleSwipeLeft = () => {
    nextMovieCard();
  };

  const nextMovieCard = () => {
    x.set(0);
    setCurrentIndex((prev) => prev + 1);
  };

  const openDetails = () => {
    if (currentMovie) {
      setSelectedMovie(currentMovie);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-10 px-4 overflow-hidden relative min-h-[calc(100vh-64px)]">
      {/* Background decorations with reduced blur for mobile GPU performance */}
      <div className="absolute top-10 right-10 w-48 h-48 sm:w-64 sm:h-64 bg-fuchsia-600 rounded-full mix-blend-multiply filter blur-[60px] opacity-25 pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-48 h-48 sm:w-64 sm:h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[60px] opacity-25 pointer-events-none" />

      {/* Hidden preloader for upcoming poster */}
      {upcomingMovie?.poster_path && (
        <link rel="prefetch" as="image" href={getTmdbImageUrl(upcomingMovie.poster_path, 'w500')} />
      )}

      <div className="text-center mb-6 z-10">
        <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
          <Compass className="w-8 h-8 text-fuchsia-400" />
          Discover
        </h1>
        <p className="text-white/70 mt-1.5 text-sm sm:text-base">Swipe right to save, left to skip</p>
      </div>

      <div className="relative w-full max-w-xs sm:max-w-sm h-[480px] sm:h-[580px] flex items-center justify-center z-20">
        {isLoading ? (
          <div className="w-14 h-14 border-4 border-fuchsia-500 border-t-transparent rounded-full animate-spin" />
        ) : currentIndex >= movies.length ? (
          <div className="text-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
            <span className="text-5xl mb-4 block">🎉</span>
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;ve seen them all!</h2>
            <p className="text-white/70 mb-6 text-sm">Check your watchlist or reshuffle for more.</p>
            <button
              onClick={handleReshuffle}
              className="flex items-center gap-2 mx-auto bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-fuchsia-500/50 hover:-translate-y-0.5 active:translate-y-0"
            >
              <RotateCw className="w-5 h-5" />
              Reshuffle
            </button>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Next Card Rendered Bounded in Background for Zero-Delay Transition */}
            {nextMovie && (
              <div className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-xl bg-gray-950 border border-white/10 scale-95 opacity-60 pointer-events-none translate-y-3">
                <Image
                  src={getTmdbImageUrl(nextMovie.poster_path, 'w500')}
                  alt={nextMovie.title}
                  fill
                  sizes="(max-width: 640px) 90vw, 384px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              </div>
            )}

            {/* Current Interactive Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMovie.id}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing select-none"
                style={{ x, rotate, opacity }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.7}
                onDragEnd={handleDragEnd}
                whileDrag={{ scale: 1.02 }}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0, transition: { duration: 0.15 } }}
              >
                <div
                  className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl bg-gray-900 border border-white/20 group"
                  onClick={openDetails}
                >
                  <Image
                    src={getTmdbImageUrl(currentMovie.poster_path, 'w500')}
                    alt={currentMovie.title}
                    fill
                    priority
                    sizes="(max-width: 640px) 90vw, 384px"
                    className="object-cover pointer-events-none"
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
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {!isLoading && currentIndex < movies.length && (
        <div className="flex items-center justify-center gap-6 sm:gap-8 mt-8 z-20">
          <button
            onClick={handleSwipeLeft}
            aria-label="Skip movie"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 hover:bg-rose-500/20 active:scale-95 backdrop-blur-md flex items-center justify-center text-rose-500 border border-rose-500/30 hover:border-rose-500 transition-all shadow-lg"
          >
            <X className="w-7 h-7 sm:w-8 sm:h-8" />
          </button>

          <div className="text-white/50 text-xs sm:text-sm font-medium tracking-widest uppercase">
            {movies.length - currentIndex} left
          </div>

          <button
            onClick={handleSwipeRight}
            aria-label="Save to watchlist"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/10 hover:bg-emerald-500/20 active:scale-95 backdrop-blur-md flex items-center justify-center text-emerald-500 border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-lg"
          >
            <Heart className="w-7 h-7 sm:w-8 sm:h-8 fill-current" />
          </button>
        </div>
      )}

      <MovieDetailModal
        isOpen={isModalOpen}
        movieId={selectedMovie?.id || null}
        movie={selectedMovie}
        onClose={() => {
          setIsModalOpen(false);
          setTimeout(() => setSelectedMovie(null), 300);
        }}
        onMovieSelect={(movie) => {
          setSelectedMovie(movie);
        }}
      />
    </div>
  );
}
