'use client';

import { useState, useEffect, useCallback } from 'react';
import { Movie } from '@/types';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import GenreFilter from '@/components/GenreFilter';
import MovieGrid from '@/components/MovieGrid';
import MovieDetailModal from '@/components/MovieDetailModal';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMovies = useCallback(async (query: string, genre: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append('query', query);
      if (genre) params.append('genre', genre);
      
      const res = await fetch(`/api/movies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setMovies(data.results || []);
      }
    } catch (error) {
      console.error('Failed to fetch movies:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchMovies(searchQuery, selectedGenre);
  }, [searchQuery, selectedGenre, fetchMovies]);

  const handleMovieSelect = (movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // slight delay to allow exit animation
    setTimeout(() => setSelectedMovie(null), 300);
  };

  return (
    <div className="pb-20">
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 mb-12 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <SearchBar onSearch={setSearchQuery} />
          <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />
        </div>
        
        {!isLoading && (
          <div className="mb-6 text-center text-white/80 font-medium">
            {movies.length > 0 ? (
              <p>Found {movies.length} amazing movies</p>
            ) : null}
          </div>
        )}

        <MovieGrid 
          movies={movies} 
          isLoading={isLoading} 
          onMovieClick={handleMovieSelect}
        />
      </div>

      <MovieDetailModal 
        isOpen={isModalOpen}
        movieId={selectedMovie?.id || null}
        onClose={handleCloseModal}
        onMovieSelect={handleMovieSelect}
      />
    </div>
  );
}
