'use client';

import { Calendar } from 'lucide-react';
import { useMemo } from 'react';

interface YearFilterProps {
  selectedYear: string;
  onYearChange: (year: string) => void;
}

export default function YearFilter({ selectedYear, onYearChange }: YearFilterProps) {
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const list: number[] = [];
    for (let y = currentYear; y >= 1970; y--) {
      list.push(y);
    }
    return list;
  }, []);

  return (
    <div className="relative group w-full max-w-xs sm:max-w-[170px]">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
        <Calendar className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-500 transition-colors" />
      </div>
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(e.target.value)}
        aria-label="Filter movies by release year"
        className="w-full pl-11 pr-10 py-3 bg-white/90 backdrop-blur-md border border-white/20 rounded-full text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-lg transition-all appearance-none cursor-pointer"
      >
        <option value="">All Years</option>
        {years.map((year) => (
          <option key={year} value={year.toString()}>
            {year}
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
