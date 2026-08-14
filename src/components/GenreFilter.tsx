'use client';

import { Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Genre } from '@/types';

interface GenreFilterProps {
  selectedGenre: string;
  onGenreChange: (genreId: string) => void;
}

export default function GenreFilter({ selectedGenre, onGenreChange }: GenreFilterProps) {
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const res = await fetch('/api/genres');
        if (res.ok) {
          const data = await res.json();
          setGenres(data.genres || []);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    }
    fetchGenres();
  }, []);

  return (
    <div className="relative group w-full max-w-xs sm:max-w-xs">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Filter className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <select
        value={selectedGenre}
        onChange={(e) => onGenreChange(e.target.value)}
        className="w-full pl-11 pr-10 py-3 bg-white/90 backdrop-blur-md border border-white/20 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-lg transition-all appearance-none cursor-pointer"
      >
        <option value="">All Genres</option>
        {genres.map((genre) => (
          <option key={genre.id} value={genre.id}>
            {genre.name}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
