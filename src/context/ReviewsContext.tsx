'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { UserReview } from '@/types';

interface AddReviewInput {
  movieId: number;
  movieTitle: string;
  moviePosterPath?: string | null;
  author: string;
  rating: number;
  content: string;
}

interface ReviewsContextType {
  reviews: UserReview[];
  addReview: (input: AddReviewInput) => void;
  deleteReview: (reviewId: string) => void;
  getMovieReviews: (movieId: number) => UserReview[];
  getUserReview: (movieId: number) => UserReview | undefined;
  getUserRating: (movieId: number) => number | null;
  setQuickRating: (movieId: number, movieTitle: string, rating: number, posterPath?: string | null) => void;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const emptySubscribe = () => () => {};

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [savedReviews, setSavedReviews] = useLocalStorage<UserReview[]>('movie-explorer-reviews', []);
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const reviews = isClient ? savedReviews : [];

  const addReview = (input: AddReviewInput) => {
    setSavedReviews((prev) => {
      // If user already reviewed this movie, update it; otherwise add new
      const existingIndex = prev.findIndex((r) => r.movieId === input.movieId);
      const newReview: UserReview = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        movieId: input.movieId,
        movieTitle: input.movieTitle,
        moviePosterPath: input.moviePosterPath,
        author: input.author.trim() || 'Anonymous Reviewer',
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        content: input.content.trim(),
        createdAt: new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = newReview;
        return copy;
      }
      return [newReview, ...prev];
    });
  };

  const setQuickRating = (movieId: number, movieTitle: string, rating: number, posterPath?: string | null) => {
    setSavedReviews((prev) => {
      const existingIndex = prev.findIndex((r) => r.movieId === movieId);
      const cleanRating = Math.max(1, Math.min(5, Math.round(rating)));

      if (existingIndex >= 0) {
        const copy = [...prev];
        copy[existingIndex] = {
          ...copy[existingIndex],
          rating: cleanRating,
          createdAt: new Date().toISOString(),
        };
        return copy;
      }

      const newReview: UserReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        movieId,
        movieTitle,
        moviePosterPath: posterPath,
        author: 'You',
        rating: cleanRating,
        content: '',
        createdAt: new Date().toISOString(),
      };
      return [newReview, ...prev];
    });
  };

  const deleteReview = (reviewId: string) => {
    setSavedReviews((prev) => prev.filter((r) => r.id !== reviewId));
  };

  const getMovieReviews = (movieId: number): UserReview[] => {
    return reviews.filter((r) => r.movieId === movieId && r.content.trim().length > 0);
  };

  const getUserReview = (movieId: number): UserReview | undefined => {
    return reviews.find((r) => r.movieId === movieId);
  };

  const getUserRating = (movieId: number): number | null => {
    const rev = reviews.find((r) => r.movieId === movieId);
    return rev ? rev.rating : null;
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        deleteReview,
        getMovieReviews,
        getUserReview,
        getUserRating,
        setQuickRating,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}
