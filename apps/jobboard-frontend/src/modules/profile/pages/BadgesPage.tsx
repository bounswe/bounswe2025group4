import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuthContext } from '@modules/auth/contexts/AuthContext';
import { BadgeCard } from '@modules/profile/components/badges/BadgeCard';
import { BADGE_CATEGORIES, BADGE_DEFINITIONS, type BadgeDefinition } from '@modules/profile/constants/badges';
import { useBadgeTypesQuery, useMyBadgesQuery, useUserBadgesQuery } from '@modules/profile/services/badge.service';
import { usePublicProfileQuery, useMyProfileQuery } from '@modules/profile/services/profile.service';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@shared/components/ui/card';

export default function BadgesPage() {
  const { user } = useAuthContext();
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const viewedUserId = routeUserId ? Number(routeUserId) : undefined;
  const isOwner = user ? (!viewedUserId || user.id === viewedUserId) : false;

  const myProfileQuery = useMyProfileQuery(isOwner);
  const publicProfileQuery = usePublicProfileQuery(viewedUserId, !isOwner);

  const profile = isOwner ? myProfileQuery.data : publicProfileQuery.data;

  const badgeTypesQuery = useBadgeTypesQuery();
  const myBadgesQuery = useMyBadgesQuery(isOwner);
  const userBadgesQuery = useUserBadgesQuery(viewedUserId, !isOwner);
  const badgesQuery = isOwner ? myBadgesQuery : userBadgesQuery;

  const isLoading =
    badgeTypesQuery.isLoading ||
    badgesQuery.isLoading ||
    (isOwner ? myProfileQuery.isLoading : publicProfileQuery.isLoading);

  const earnedBadgeCodes = new Set(badgesQuery.data?.map((b) => b.badgeType) || []);

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

  const allBadges: BadgeDefinition[] =
    (badgeTypesQuery.data ?? [])
      .map((badgeType) => {
        const local = BADGE_DEFINITIONS[badgeType.type as keyof typeof BADGE_DEFINITIONS];
        if (!local) return null;

        return {
          ...local,
          name: badgeType.name ?? local.name,
          description: badgeType.description ?? local.description,
          criteria: badgeType.criteria ?? local.criteria,
          threshold: badgeType.threshold ?? local.threshold,
        };
      })
      .filter((b): b is BadgeDefinition => Boolean(b));

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6">
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </button>

      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Badges</h1>
          <p className="text-muted-foreground">
            {isOwner
              ? `You have earned ${earnedBadgeCodes.size} out of ${allBadges.length} badges`
              : `${profileName} has earned ${earnedBadgeCodes.size} out of ${allBadges.length} badges`}
          </p>
        </div>

        {BADGE_CATEGORIES.map((category) => {
          const categoryBadges = allBadges.filter((badge) => badge.category === category);
          const earnedCount = categoryBadges.filter((badge) =>
            earnedBadgeCodes.has(badge.code)
          ).length;

          return (
            <Card key={category}>
              <CardHeader className="px-6">
                <CardTitle className="text-xl">{category}</CardTitle>
                <CardDescription className="text-sm">
                  {earnedCount} of {categoryBadges.length} earned
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryBadges.map((badge) => (
                    <BadgeCard
                      key={badge.code}
                      badge={badge}
                      isEarned={earnedBadgeCodes.has(badge.code)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
