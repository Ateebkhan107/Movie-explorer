'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebounceValue } from 'usehooks-ts';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [value, setValue] = useState('');
  const [debouncedValue] = useDebounceValue(value, 500);

  useEffect(() => {
    onSearch(debouncedValue);
  }, [debouncedValue, onSearch]);

  return (
    <div className="relative group w-full max-w-xs sm:max-w-md">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for movies..."
        className="w-full pl-11 pr-4 py-3 bg-white/90 backdrop-blur-md border border-white/20 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-lg transition-all"
      />
    </div>
  );
}
