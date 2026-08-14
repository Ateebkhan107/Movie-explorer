'use client';

import { Movie } from '@/types';
import { IMG_BASE } from '@/lib/tmdb';
import { Star, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useWatchlist } from '@/context/WatchlistContext';
import { useState, useEffect } from 'react';
import Image from 'next/image';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
  index?: number;
}

export default function MovieCard({ movie, onClick, index = 0 }: MovieCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isSaved, setIsSaved] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setIsSaved(isInWatchlist(movie.id));
  }, [isInWatchlist, movie.id]);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      removeFromWatchlist(movie.id);
    } else {
      addToWatchlist(movie);
    }
    setIsSaved(!isSaved);
  };

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  const poster = movie.poster_path 
    ? `${IMG_BASE}${movie.poster_path}` 
    : 'https://via.placeholder.com/300x450/667eea/ffffff?text=No+Image';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(movie)}
      className="group relative bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 cursor-pointer shadow-lg hover:shadow-2xl hover:border-white/40 transition-all flex flex-col h-full"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden">
        <img
          src={poster}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Watchlist Button */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            isSaved 
              ? 'bg-rose-500/90 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' 
              : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-white hover:scale-110'
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
          
          <div className="flex items-center justify-between text-sm text-gray-200">
            <div className="flex items-center gap-1 bg-yellow-400/20 text-yellow-400 px-2 py-1 rounded-full border border-yellow-400/30">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-medium">{rating}</span>
            </div>
            <div className="bg-white/20 px-2 py-1 rounded-full border border-white/30 text-xs font-medium">
              {year}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
