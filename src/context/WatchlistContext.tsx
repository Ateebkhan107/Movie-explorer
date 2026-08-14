'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Movie } from '@/types';
import { useLocalStorage } from 'usehooks-ts';

interface WatchlistContextType {
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [savedMovies, setSavedMovies] = useLocalStorage<Movie[]>('movie-watchlist', []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToWatchlist = (movie: Movie) => {
    setSavedMovies((prev) => {
      if (prev.find((m) => m.id === movie.id)) return prev;
      return [...prev, movie];
    });
  };

  const removeFromWatchlist = (id: number) => {
    setSavedMovies((prev) => prev.filter((movie) => movie.id !== id));
  };

  const isInWatchlist = (id: number) => {
    return savedMovies.some((movie) => movie.id === id);
  };

  // Prevent hydration mismatch by providing empty array initially
  const watchlist = mounted ? savedMovies : [];

  return (
    <WatchlistContext.Provider
      value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
}
