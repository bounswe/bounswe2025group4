import { Award, Lock } from 'lucide-react';
import { cn } from '@shared/lib/utils';
import type { BadgeDefinition } from '@modules/profile/constants/badges';
import { Card, CardContent } from '@shared/components/ui/card';

interface BadgeCardProps {
  badge: BadgeDefinition;
  isEarned: boolean;
  compact?: boolean;
  showDescription?: boolean;
  wrapTitle?: boolean;
}

export function BadgeCard({
  badge,
  isEarned,
  compact = false,
  showDescription = true,
  wrapTitle = false,
}: BadgeCardProps) {
  return (
    <Card
      className={cn(
        'group relative transition-all duration-200',
        isEarned
          ? 'hover:border-green-600/50 hover:shadow-md'
          : 'bg-muted/30 border-muted-foreground/20 opacity-60',
        compact ? 'p-3' : 'p-4'
      )}
    >
      {!isEarned && (
        <div className="absolute top-2 right-2 z-10">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </div>
      )}

      <CardContent className={cn('p-0', compact ? 'pt-0' : 'pt-0')}>
        <div className={cn('flex items-start gap-3', compact && 'gap-2')}>
        <div
          className={cn(
            'flex items-center justify-center rounded-full shrink-0 transition-colors',
            isEarned
              ? 'bg-green-600 text-white'
              : 'bg-muted-foreground/20 text-muted-foreground',
            compact ? 'h-8 w-8 mt-1' : 'h-10 w-10'
          )}
        >
          <Award className={cn(compact ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'font-semibold',
              isEarned ? 'text-foreground' : 'text-muted-foreground',
              compact ? 'text-sm' : 'text-base',
              wrapTitle ? 'whitespace-normal break-words' : 'truncate'
            )}
          >
            {badge.name}
          </h4>
          {showDescription && (
            <p
              className={cn(
                'text-muted-foreground line-clamp-2',
                compact ? 'text-xs mt-0.5' : 'text-sm mt-1'
              )}
            >
              {badge.description}
            </p>
          )}

          {!compact && (
            <p className="text-xs text-muted-foreground/80 mt-2 italic">
              {badge.criteria}
            </p>
          )}
        </div>
        </div>
      </CardContent>
    </Card>
  );
}
