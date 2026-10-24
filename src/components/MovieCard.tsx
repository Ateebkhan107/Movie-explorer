'use client';

import { Movie } from '@/types';
import { getTmdbImageUrl } from '@/lib/tmdb';
import { Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWatchlist } from '@/context/WatchlistContext';
import { useReviews } from '@/context/ReviewsContext';
import Image from 'next/image';
import { useState } from 'react';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  index?: number;
}

export default function MovieCard({ movie, onClick, index = 0 }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { getUserRating } = useReviews();
  const userRating = getUserRating(movie.id);
  const isSaved = isInWatchlist(movie.id);
  const [imageError, setImageError] = useState(false);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
  };

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  
  // Use w342 for responsive poster grids
  const poster = imageError || !movie.poster_path
    ? 'https://via.placeholder.com/342x513/1e1b4b/ffffff?text=No+Poster'
    : getTmdbImageUrl(movie.poster_path, 'w342');

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min((index % 20) * 0.02, 0.2) }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(movie)}
      className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 cursor-pointer shadow-lg hover:shadow-2xl hover:border-white/40 transition-all flex flex-col h-full select-none"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-900">
        <Image
          src={poster}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 22vw, 240px"
          priority={index < 4}
          onError={() => setImageError(true)}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Watchlist Button */}
        <button
          onClick={toggleWatchlist}
          aria-label={isSaved ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
          className={`absolute top-2.5 right-2.5 min-w-[44px] min-h-[44px] rounded-full backdrop-blur-md transition-all z-10 flex items-center justify-center ${
            isSaved 
              ? 'bg-rose-500/90 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
              : 'bg-black/50 text-white/80 hover:bg-black/75 hover:text-white hover:scale-105'
          }`}
        >
          <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1 mb-2 text-white drop-shadow-md">
            {movie.title}
          </h3>
          
          <div className="flex items-center justify-between text-sm text-gray-200 gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-400/30 text-xs font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{rating}</span>
            </div>
            {userRating !== null && (
              <div className="flex items-center gap-1 bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 text-xs font-semibold">
                <Star className="w-3 h-3 fill-current text-purple-400" />
                <span>You: {userRating}/5</span>
              </div>
            )}
            <div className="bg-white/20 px-2 py-0.5 rounded-full border border-white/30 text-xs font-medium ml-auto">
              {year}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
