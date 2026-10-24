'use client';

import { MovieDetails, Movie } from '@/types';
import { getTmdbImageUrl } from '@/lib/tmdb';
import { X, Star, Clock, Play, AlertCircle, RotateCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import MovieCard from './MovieCard';
import MovieReviewsSection from './MovieReviewsSection';

interface MovieDetailModalProps {
  movie?: Movie | null;
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export default function MovieDetailModal({
  movie,
  movieId,
  isOpen,
  onClose,
  onMovieSelect,
}: MovieDetailModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleClose = useCallback(() => {
    setShowTrailer(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen || !movieId) {
      setDetails(null);
      setSimilar([]);
      setLoading(false);
      setError(null);
      setShowTrailer(false);
      setImageError(false);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setShowTrailer(false);
    setImageError(false);

    async function fetchDetails() {
      try {
        const [detailsResult, similarResult] = await Promise.allSettled([
          fetch(`/api/movies/${movieId}`, { signal: controller.signal }),
          fetch(`/api/movies/${movieId}/similar`, { signal: controller.signal }),
        ]);

        if (!isMounted) return;

        if (detailsResult.status === 'fulfilled' && detailsResult.value.ok) {
          const data = await detailsResult.value.json();
          setDetails(data);
        } else {
          setError('Unable to load full cast and trailer.');
        }

        if (similarResult.status === 'fulfilled' && similarResult.value.ok) {
          const similarData = await similarResult.value.json();
          setSimilar(similarData.results?.slice(0, 10) || []);
        }
      } catch (err: unknown) {
        if ((err as Error)?.name !== 'AbortError' && isMounted) {
          setError('Network error while loading movie details.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [movieId, isOpen, retryTrigger]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, handleClose]);

  // Lock body scroll and cleanup on close
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const displayMovie = details || movie;

  const trailer = details?.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  const backdropPath = displayMovie?.backdrop_path || displayMovie?.poster_path;
  const backdropSrc = !imageError && backdropPath
    ? getTmdbImageUrl(backdropPath, 'w780')
    : 'https://via.placeholder.com/1280x720/1e1b4b/ffffff?text=No+Backdrop';

  const year = displayMovie?.release_date
    ? new Date(displayMovie.release_date).getFullYear()
    : 'N/A';
  const rating = displayMovie?.vote_average
    ? displayMovie.vote_average.toFixed(1)
    : 'N/A';

  const handleRetry = () => {
    setRetryTrigger((prev) => prev + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          >
            <button
              onClick={handleClose}
              aria-label="Close modal"
              className="absolute top-4 right-4 z-50 min-w-[44px] min-h-[44px] flex items-center justify-center p-2 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {loading && !displayMovie ? (
              <div className="h-[60vh] flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Loading movie details...</p>
              </div>
            ) : !displayMovie && error ? (
              <div className="h-[60vh] flex flex-col items-center justify-center text-center p-6 gap-4">
                <div className="p-3 bg-rose-500/20 text-rose-400 rounded-full border border-rose-500/30">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Failed to load movie</h3>
                  <p className="text-gray-400 text-sm max-w-md">{error}</p>
                </div>
                <button
                  onClick={handleRetry}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium transition-colors shadow-lg"
                >
                  <RotateCw className="w-4 h-4" />
                  Try Again
                </button>
              </div>
            ) : displayMovie ? (
              <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* Hero Section */}
                <div className="relative h-[40vh] sm:h-[50vh] w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10" />
                  <Image
                    src={backdropSrc}
                    alt={displayMovie.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 1024px"
                    onError={() => setImageError(true)}
                    className="object-cover object-top"
                  />

                  {trailer && !showTrailer && (
                    <button
                      onClick={() => setShowTrailer(true)}
                      aria-label="Play trailer"
                      className="absolute inset-0 z-20 flex items-center justify-center group"
                    >
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-indigo-600/80 group-hover:scale-110 transition-all border border-white/30 shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                        <Play className="w-10 h-10 text-white ml-2 fill-white" />
                      </div>
                    </button>
                  )}

                  {showTrailer && trailer && (
                    <div className="absolute inset-0 z-30 bg-black">
                      <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-20">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                      {displayMovie.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                      <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{rating}</span>
                      </div>
                      {details?.runtime && details.runtime > 0 ? (
                        <div className="flex items-center gap-1 text-gray-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                          <Clock className="w-4 h-4" />
                          <span>{details.runtime} min</span>
                        </div>
                      ) : null}
                      <div className="text-gray-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        {year}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-10 space-y-10">
                  {error && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between text-amber-200 text-sm">
                      <span>Unable to load full cast and trailers.</span>
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 rounded-lg font-medium transition-colors"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        Retry
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                        <p className="text-gray-300 leading-relaxed text-lg font-light">
                          {displayMovie.overview || 'No overview available.'}
                        </p>
                      </div>

                      {details?.genres && details.genres.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Genres</h3>
                          <div className="flex flex-wrap gap-2">
                            {details.genres.map((g) => (
                              <span
                                key={g.id}
                                className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300"
                              >
                                {g.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Top Cast */}
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4">Top Cast</h3>
                      {loading && !details ? (
                        <div className="space-y-3">
                          {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                              <div className="w-12 h-12 rounded-full bg-white/10 shrink-0" />
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/5 rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : details?.credits?.cast && details.credits.cast.length > 0 ? (
                        <div className="space-y-4">
                          {details.credits.cast.slice(0, 5).map((person) => (
                            <div key={person.id} className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 shrink-0 border border-white/10 relative">
                                {person.profile_path ? (
                                  <Image
                                    src={getTmdbImageUrl(person.profile_path, 'w185')}
                                    alt={person.name}
                                    width={48}
                                    height={48}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-bold">
                                    {person.name.charAt(0)}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-white font-medium truncate">{person.name}</p>
                                <p className="text-gray-400 text-sm truncate">{person.character}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">Cast information unavailable.</p>
                      )}
                    </div>
                  </div>

                  {/* Ratings & Reviews Section */}
                  <MovieReviewsSection
                    movieId={displayMovie.id}
                    movieTitle={displayMovie.title}
                    moviePosterPath={displayMovie.poster_path}
                    tmdbRating={displayMovie.vote_average}
                  />

                  {/* Similar Movies */}
                  {similar.length > 0 && (
                    <div className="pt-8 border-t border-white/10">
                      <h3 className="text-2xl font-bold text-white mb-6">Similar Movies</h3>
                      <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 sm:-mx-10 sm:px-10 snap-x custom-scrollbar">
                        {similar.map((simMovie) => (
                          <div key={simMovie.id} className="w-[200px] shrink-0 snap-start">
                            <MovieCard movie={simMovie} onClick={onMovieSelect} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
