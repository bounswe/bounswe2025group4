import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@modules/auth/contexts/AuthContext';
import { BadgeCard } from '@modules/profile/components/badges/BadgeCard';
import { BADGE_CATEGORIES, getBadgesByCategory } from '@modules/profile/constants/badges';
import { usePublicProfileQuery, useMyProfileQuery } from '@modules/profile/services/profile.service';
import CenteredLoader from '@shared/components/common/CenteredLoader';

export default function BadgesPage() {
  const { user } = useAuthContext();
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const viewedUserId = routeUserId ? Number(routeUserId) : undefined;
  const isOwner = user ? (!viewedUserId || user.id === viewedUserId) : false;

  const myProfileQuery = useMyProfileQuery(isOwner);
  const publicProfileQuery = usePublicProfileQuery(viewedUserId, !isOwner);

  const profile = isOwner ? myProfileQuery.data : publicProfileQuery.data;
  const isLoading = isOwner ? myProfileQuery.isLoading : publicProfileQuery.isLoading;

  const earnedBadgeCodes = new Set(profile?.badges?.map((b) => b.badgeType) || []);

  const handleBack = () => {
    if (viewedUserId) {
      navigate(`/profile/${viewedUserId}`);
    } else {
      navigate('/profile');
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  const profileName = profile
    ? `${profile.firstName} ${profile.lastName}`
    : 'User';

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-16">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Badges</h1>
          <p className="text-muted-foreground">
            {isOwner
              ? `You have earned ${earnedBadgeCodes.size} out of 18 badges`
              : `${profileName} has earned ${earnedBadgeCodes.size} out of 18 badges`}
          </p>
        </div>

        <div className="space-y-8">
          {BADGE_CATEGORIES.map((category) => {
            const categoryBadges = getBadgesByCategory(category);
            const earnedCount = categoryBadges.filter((badge) =>
              earnedBadgeCodes.has(badge.code)
            ).length;

            return (
              <div key={category}>
                <div className="mb-4">
                  <h2 className="text-xl font-semibold">{category}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {earnedCount} of {categoryBadges.length} earned
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryBadges.map((badge) => (
                    <BadgeCard
                      key={badge.code}
                      badge={badge}
                      isEarned={earnedBadgeCodes.has(badge.code)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
