import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BadgeCard } from './BadgeCard';
import { BADGE_DEFINITIONS } from '@modules/profile/constants/badges';
import type { Badge } from '@shared/types/profile.types';

interface BadgesSectionProps {
  badges?: Badge[];
  userId?: number;
  isPublicView?: boolean;
}

export function BadgesSection({ badges = [], userId, isPublicView = false }: BadgesSectionProps) {
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
    <div className="bg-card rounded-lg border shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Badges</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {earnedBadges.length > 0
              ? `${earnedBadgeCodes.size} earned`
              : 'No badges earned yet'}
          </p>
        </div>
        {earnedBadgeCodes.size > 0 && (
          <button
            onClick={handleViewAll}
            className="flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {earnedBadges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {earnedBadges.map((badge) => (
            <BadgeCard key={badge.code} badge={badge} isEarned={true} compact />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p>Start participating to earn badges!</p>
        </div>
      )}
    </div>
  );
}
