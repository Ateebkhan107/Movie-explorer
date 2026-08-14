'use client';

import { MovieDetails, Movie } from '@/types';
import { IMG_BASE } from '@/lib/tmdb';
import { X, Star, Clock, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import MovieCard from './MovieCard';

interface MovieDetailModalProps {
  movieId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onMovieSelect: (movie: Movie) => void;
}

export default function MovieDetailModal({ movieId, isOpen, onClose, onMovieSelect }: MovieDetailModalProps) {
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (!isOpen || !movieId) return;

    let isMounted = true;
    setShowTrailer(false);
    
    async function fetchDetails() {
      setLoading(true);
      try {
        const [detailsRes, similarRes] = await Promise.all([
          fetch(`/api/movies/${movieId}`),
          fetch(`/api/movies/${movieId}/similar`)
        ]);
        
        if (detailsRes.ok && isMounted) {
          setDetails(await detailsRes.json());
        }
        if (similarRes.ok && isMounted) {
          const similarData = await similarRes.json();
          setSimilar(similarData.results?.slice(0, 10) || []);
        }
      } catch (error) {
        console.error('Error fetching details:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDetails();
    
    return () => {
      isMounted = false;
    };
  }, [movieId, isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Lock body scroll
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

  const trailer = details?.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-b from-gray-900 to-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 flex flex-col"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {loading ? (
              <div className="h-[60vh] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : details ? (
              <div className="overflow-y-auto overflow-x-hidden custom-scrollbar">
                {/* Hero Section */}
                <div className="relative h-[40vh] sm:h-[50vh] w-full">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent z-10" />
                  <img
                    src={details.poster_path ? `${IMG_BASE}${details.poster_path}` : 'https://via.placeholder.com/1920x1080/1a202c/ffffff?text=No+Image'}
                    alt={details.title}
                    className="w-full h-full object-cover object-top"
                  />
                  
                  {trailer && !showTrailer && (
                    <button 
                      onClick={() => setShowTrailer(true)}
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
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 z-20">
                    <h2 className="text-3xl sm:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                      {details.title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                      <div className="flex items-center gap-1 text-yellow-400 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{details.vote_average.toFixed(1)}</span>
                      </div>
                      {details.runtime > 0 && (
                        <div className="flex items-center gap-1 text-gray-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                          <Clock className="w-4 h-4" />
                          <span>{details.runtime} min</span>
                        </div>
                      )}
                      <div className="text-gray-300 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                        {details.release_date?.substring(0, 4)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 sm:p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-3">Overview</h3>
                        <p className="text-gray-300 leading-relaxed text-lg font-light">
                          {details.overview || 'No overview available.'}
                        </p>
                      </div>
                      
                      {details.genres?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Genres</h3>
                          <div className="flex flex-wrap gap-2">
                            {details.genres.map(g => (
                              <span key={g.id} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
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
                      <div className="space-y-4">
                        {details.credits?.cast?.slice(0, 5).map(person => (
                          <div key={person.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-800 shrink-0 border border-white/10">
                              {person.profile_path ? (
                                <img 
                                  src={`${IMG_BASE}${person.profile_path}`} 
                                  alt={person.name}
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
                    </div>
                  </div>

                  {/* Similar Movies */}
                  {similar.length > 0 && (
                    <div className="pt-8 border-t border-white/10">
                      <h3 className="text-2xl font-bold text-white mb-6">Similar Movies</h3>
                      <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 sm:-mx-10 sm:px-10 snap-x custom-scrollbar">
                        {similar.map(movie => (
                          <div key={movie.id} className="w-[200px] shrink-0 snap-start">
                            <MovieCard movie={movie} onClick={onMovieSelect} />
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
