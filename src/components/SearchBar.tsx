'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading = false }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounceValue(value, 400);
  const inputRef = useRef<HTMLInputElement>(null);
  const isInitialMount = useRef(true);
  const onSearchRef = useRef(onSearch);

  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSearchRef.current(debouncedValue);
  }, [debouncedValue]);

  const handleClear = () => {
    setValue('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative group w-full max-w-xs sm:max-w-md">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for movies..."
        aria-label="Search for movies"
        className="w-full pl-11 pr-10 py-3 bg-white/90 backdrop-blur-md border border-white/20 rounded-full text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-lg transition-all"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search input"
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isLoading && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
