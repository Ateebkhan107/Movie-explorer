'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Movie } from '@/types';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import GenreFilter from '@/components/GenreFilter';
import YearFilter from '@/components/YearFilter';
import MovieGrid from '@/components/MovieGrid';
import MovieDetailModal from '@/components/MovieDetailModal';
import { WifiOff, RotateCw, AlertCircle, ArrowUp, Loader2 } from 'lucide-react';

export default function Home() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isDegraded, setIsDegraded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Initial load and filter/search changes
  useEffect(() => {
    const controller = new AbortController();

    async function fetchData() {
      try {
        const params = new URLSearchParams();
        if (searchQuery.trim()) params.append('query', searchQuery.trim());
        if (selectedGenre) params.append('genre', selectedGenre);
        if (selectedYear) params.append('year', selectedYear);
        params.append('page', '1');

        const res = await fetch(`/api/movies?${params.toString()}`, {
          signal: controller.signal,
        });

        if (res.ok) {
          const data = await res.json();
          setMovies(data.results || []);
          setPage(1);
          setTotalPages(Math.min(data.total_pages || 1, 500));
          setTotalResults(data.total_results || (data.results?.length ?? 0));
          setIsDegraded(Boolean(data.isDegraded || data.isFallback));
          setErrorMessage(null);
        } else {
          const errorData = await res.json().catch(() => ({}));
          setErrorMessage(
            errorData.error || 'Unable to load movies right now. Please check your connection.'
          );
        }
      } catch (error: unknown) {
        if ((error as Error)?.name !== 'AbortError') {
          console.error('Failed to fetch movies:', error);
          setErrorMessage('Network connection lost. Please try again.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          setIsSearching(false);
        }
      }
    }

    setIsLoading(true);
    fetchData();

    return () => {
      controller.abort();
    };
  }, [searchQuery, selectedGenre, selectedYear, retryTrigger]);

  // Load next page
  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || page >= totalPages) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('query', searchQuery.trim());
      if (selectedGenre) params.append('genre', selectedGenre);
      if (selectedYear) params.append('year', selectedYear);
      params.append('page', nextPage.toString());

      const res = await fetch(`/api/movies?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newResults: Movie[] = data.results || [];
        setMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const uniqueNew = newResults.filter((m) => !existingIds.has(m.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        if (typeof data.total_pages === 'number') {
          setTotalPages(Math.min(data.total_pages, 500));
        }
      }
    } catch (error) {
      console.error('Failed to load more movies:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoading, isLoadingMore, page, totalPages, searchQuery, selectedGenre, selectedYear]);

  // Infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && !isLoadingMore && page < totalPages) {
          loadMore();
        }
      },
      { rootMargin: '400px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isLoading, isLoadingMore, page, totalPages, loadMore]);

  // Show/hide floating scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery((prev) => {
      if (prev !== query) {
        setIsSearching(true);
      }
      return query;
    });
  }, []);

  const handleGenreChange = useCallback((genre: string) => {
    setSelectedGenre((prev) => {
      if (prev !== genre) {
        setIsSearching(true);
      }
      return genre;
    });
  }, []);

  const handleYearChange = useCallback((year: string) => {
    setSelectedYear((prev) => {
      if (prev !== year) {
        setIsSearching(true);
      }
      return year;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedGenre('');
    setSelectedYear('');
    setSearchQuery('');
  }, []);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setErrorMessage(null);
    setRetryTrigger((prev) => prev + 1);
  }, []);

  const handleMovieSelect = useCallback((movie: Movie) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedMovie(null), 300);
  }, []);

  const hasActiveFilters = Boolean(searchQuery || selectedGenre || selectedYear);

  return (
    <div className="pb-20">
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-20">
        {/* Controls container */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-4 sm:p-6 shadow-2xl border border-white/20 mb-8 flex flex-col md:flex-row gap-4 items-center justify-center">
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center justify-center">
            <GenreFilter selectedGenre={selectedGenre} onGenreChange={handleGenreChange} />
            <YearFilter selectedYear={selectedYear} onYearChange={handleYearChange} />
          </div>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs sm:text-sm text-indigo-300 hover:text-white underline transition-colors px-2 py-1 shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Degraded Offline Mode Banner */}
        {isDegraded && (
          <div className="mb-8 max-w-xl mx-auto bg-amber-500/20 border border-amber-500/40 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between text-amber-200 text-sm">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 shrink-0 text-amber-400" />
              <span>Offline Mode: Displaying sample movies due to network limitations.</span>
            </div>
            <button
              onClick={handleRetry}
              className="ml-3 px-3 py-1.5 bg-amber-500/30 hover:bg-amber-500/50 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Error State Banner */}
        {errorMessage && (
          <div className="mb-8 max-w-xl mx-auto bg-rose-500/20 border border-rose-500/40 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between text-rose-200 text-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleRetry}
              className="ml-3 px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 text-white rounded-lg font-medium transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        )}

        {/* Movie Count Header */}
        {!isLoading && !errorMessage && (
          <div className="mb-6 text-center text-white/80 font-medium text-sm sm:text-base">
            {movies.length > 0 ? (
              <p>
                Showing {movies.length} {totalResults > movies.length ? `of ${totalResults.toLocaleString()}` : ''} amazing movies
                {selectedYear ? ` • Year ${selectedYear}` : ''}
              </p>
            ) : null}
          </div>
        )}

        {/* Movie Grid */}
        <div className={`transition-opacity duration-200 ${isSearching ? 'opacity-70' : 'opacity-100'}`}>
          <MovieGrid
            movies={movies}
            isLoading={isLoading}
            isLoadingMore={isLoadingMore}
            onMovieClick={handleMovieSelect}
            emptyMessage={
              searchQuery
                ? `No movies found matching "${searchQuery}". Try a different term or year.`
                : selectedYear
                ? `No movies found for year ${selectedYear}. Try another year.`
                : 'No movies found.'
            }
          />
        </div>

        {/* Infinite Scroll Sentinel & Load More UI */}
        {!isLoading && movies.length > 0 && (
          <div className="mt-12 flex flex-col items-center justify-center gap-4">
            {/* Invisible sentinel observed by IntersectionObserver for auto-scroll */}
            <div ref={sentinelRef} className="h-6 w-full" aria-hidden="true" />

            {isLoadingMore && (
              <div className="flex items-center gap-2 text-indigo-300 font-medium py-3">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Loading more movies...</span>
              </div>
            )}

            {!isLoadingMore && page < totalPages && (
              <button
                onClick={loadMore}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium text-sm border border-white/20 backdrop-blur-md transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 flex items-center gap-2"
              >
                Load More Movies
              </button>
            )}

            {page >= totalPages && totalPages > 1 && (
              <p className="text-white/50 text-sm py-4">
                You&apos;ve reached the end of the collection.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Floating Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-full shadow-2xl backdrop-blur-md border border-white/20 transition-all hover:scale-110 active:scale-95"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Movie Detail Modal */}
      <MovieDetailModal
        isOpen={isModalOpen}
        movieId={selectedMovie?.id || null}
        movie={selectedMovie}
        onClose={handleCloseModal}
        onMovieSelect={handleMovieSelect}
      />
    </div>
  );
}
