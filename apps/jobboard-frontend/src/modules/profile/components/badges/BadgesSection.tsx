import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { BadgeCard } from './BadgeCard';
import { BADGE_DEFINITIONS } from '@modules/profile/constants/badges';
import type { Badge } from '@shared/types/profile.types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@shared/components/ui/card';

interface BadgesSectionProps {
  badges?: Badge[];
  userId?: number;
  isPublicView?: boolean;
  isLoading?: boolean;
}

export function BadgesSection({ badges = [], userId, isPublicView = false, isLoading = false }: BadgesSectionProps) {
  const navigate = useNavigate();
  const earnedBadgeCodes = new Set(badges.map((b) => b.badgeType));

  const earnedBadges = badges
    .map((b) => BADGE_DEFINITIONS[b.badgeType as keyof typeof BADGE_DEFINITIONS])
    .filter(Boolean)
    .slice(0, 6);

  const handleViewAll = () => {
    if (userId) {
      navigate(`/profile/${userId}/badges`);
    } else {
      navigate('/profile/badges');
    }
  };

  if (earnedBadges.length === 0 && isPublicView) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="px-4">
        <CardTitle className="flex items-center justify-between">
          <span>Badges</span>
          {!isLoading && (
            <button
              onClick={handleViewAll}
              className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </CardTitle>
        <CardDescription>
          {isLoading
            ? 'Loading badges...'
            : earnedBadges.length > 0
            ? `${earnedBadgeCodes.size} earned`
            : 'No badges earned yet'}
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8" role="status" aria-label="Loading badges">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : earnedBadges.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {earnedBadges.map((badge) => (
              <BadgeCard
                key={badge.code}
                badge={badge}
                isEarned={true}
                compact
                showDescription={false}
                wrapTitle
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>Start participating to earn badges!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
