import { Star } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import { useState } from 'react';

interface StarRatingProps {
  value: number | null | undefined;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverValue(null);
    }
  };

  // Handle null/undefined values by defaulting to 0
  const safeValue = value ?? 0;
  const displayValue = hoverValue ?? safeValue;
  const isInteractive = !readonly && onChange;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }, (_, index) => {
          const starValue = index + 1;
          const fillPercentage = Math.max(
            0,
            Math.min(100, (displayValue - index) * 100)
          );

          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              className={cn(
                'relative transition-all',
                isInteractive && 'cursor-pointer hover:scale-110',
                readonly && 'cursor-default'
              )}
              aria-label={`Rate ${starValue} out of ${max}`}
            >
              <div className="relative">
                <Star
                  className={cn(
                    sizeClasses[size],
                    'text-muted-foreground',
                    isInteractive && hoverValue && 'transition-colors'
                  )}
                  fill="none"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    className={cn(sizeClasses[size], 'text-yellow-500')}
                    fill="currentColor"
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground ml-1">
          {safeValue.toFixed(1)}
        </span>
      )}
    </div>
  );
}
