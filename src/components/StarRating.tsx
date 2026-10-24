'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showLabel?: boolean;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Masterpiece',
};

export default function StarRating({
  rating,
  maxStars = 5,
  size = 'md',
  interactive = false,
  onChange,
  showLabel = false,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const activeRating = hoverRating !== null ? hoverRating : rating;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  }[size];

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {Array.from({ length: maxStars }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= activeRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starValue)}
              onMouseEnter={() => interactive && setHoverRating(starValue)}
              aria-label={`Rate ${starValue} of ${maxStars} stars`}
              className={`transition-transform focus:outline-none ${
                interactive
                  ? 'cursor-pointer hover:scale-125 active:scale-95'
                  : 'cursor-default pointer-events-none'
              }`}
            >
              <Star
                className={`${sizeClasses} transition-colors ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]'
                    : 'text-gray-500 fill-transparent hover:text-amber-300/60'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showLabel && activeRating > 0 && (
        <span className="text-xs sm:text-sm font-medium text-amber-300">
          {RATING_LABELS[activeRating] || `${activeRating}/${maxStars}`}
        </span>
      )}
    </div>
  );
}
