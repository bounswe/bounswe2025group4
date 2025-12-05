import { StarRating } from '@shared/components/ui/star-rating';
import { Card } from '@shared/components/ui/card';
import { useTranslation } from 'react-i18next';
import type { ReviewResponse } from '@shared/types/workplace.types';

interface ReviewStatsProps {
  overallAvg: number | null | undefined;
  ethicalAverages: Record<string, number | null | undefined>;
  ethicalTags?: string[];
  totalReviews?: number;
  ratingDistribution?: {
    0?: number;
    1?: number;
    2?: number;
    3?: number;
    4?: number;
    5?: number;
  };
  recentReviews?: ReviewResponse[];
}

export function ReviewStats({
  overallAvg,
  ethicalAverages,
  ethicalTags = [],
  totalReviews = 0,
  ratingDistribution,
  recentReviews = [],
}: ReviewStatsProps) {
  const { t } = useTranslation('common');

  const safeOverallAvg = overallAvg != null && !isNaN(overallAvg) ? overallAvg : 0;
  const roundedOverall = Math.min(5, Math.max(1, Math.round(safeOverallAvg || 0)));

  // Build distribution from props (preferred)
  const seedDistribution: Record<number, number> = [1, 2, 3, 4, 5].reduce(
    (acc, rating) => {
      const raw = ratingDistribution?.[rating as keyof typeof ratingDistribution] ?? 0;
      acc[rating] = Number.isFinite(raw as number) ? Number(raw) : 0;
      return acc;
    },
    {} as Record<number, number>
  );

  const countFromDistribution = Object.values(seedDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  // Build distribution from subcategory ratings
  const distributionFromPolicies: Record<number, number> = recentReviews.reduce(
    (acc, review) => {
      Object.values(review.ethicalPolicyRatings || {}).forEach((value) => {
        const bucket = Math.min(5, Math.max(1, Math.round(Number(value) || 0)));
        acc[bucket] = (acc[bucket] || 0) + 1;
      });
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  const countFromPolicies = Object.values(distributionFromPolicies).reduce(
    (sum, count) => sum + count,
    0
  );

  const distributionFromReviews: Record<number, number> = recentReviews.reduce(
    (acc, review) => {
      const bucket = Math.min(5, Math.max(1, Math.round(review.overallRating)));
      acc[bucket] = (acc[bucket] || 0) + 1;
      return acc;
    },
    { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>
  );

  const countFromRecent = Object.values(distributionFromReviews).reduce(
    (sum, count) => sum + count,
    0
  );

  // Final distribution preference: provided > derived from reviews > fallback from average
  const normalizedDistribution =
    countFromDistribution > 0
      ? seedDistribution
      : countFromPolicies > 0
      ? distributionFromPolicies
      : countFromRecent > 0
      ? distributionFromReviews
      : (() => {
          const fallback: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
          if (totalReviews && totalReviews > 0) {
            fallback[roundedOverall] = totalReviews;
          }
          return fallback;
        })();

  const distributionTotal = Object.values(normalizedDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  const distributionDenominator =
    distributionTotal > 0 && distributionTotal <= 1 ? 1 : distributionTotal;

  // Convert policy names to readable format
  const formatPolicyName = (policy: string) => {
    return policy.replace(/([A-Z])/g, ' $1').trim();
  };

  // Get all categories - use keys from ethicalAverages if available, otherwise use ethicalTags
  const allCategories = Object.keys(ethicalAverages).length > 0 
    ? Object.keys(ethicalAverages)
    : ethicalTags.length > 0
    ? ethicalTags
    : [];

  // Create policy entries with values from ethicalAverages or 0 if not present
  const policyEntries: [string, number][] = allCategories.map((policy) => {
    const average = ethicalAverages[policy];
    return [policy, average != null && !isNaN(average) ? average : 0];
  });

  // Calculate total reviews from distribution (only if it looks like counts)
  const effectiveTotalReviews =
    totalReviews && totalReviews > 0 ? totalReviews : recentReviews.length;

  // Calculate percentages for distribution
  const getPercentage = (count: number) => {
    if (distributionDenominator <= 0) return 0;
    return Math.round((count / distributionDenominator) * 100);
  };

  return (
    <Card className="p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-foreground mb-2">
              {safeOverallAvg.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              <StarRating value={safeOverallAvg} readonly size="md" />
            </div>
            {effectiveTotalReviews > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('reviews.basedOn', { count: effectiveTotalReviews })}
              </p>
            )}
          </div>
          
          {/* Rating Distribution */}
          <div className="mt-6">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = normalizedDistribution[rating] || 0;
                const percentage = getPercentage(count);
                const hasReviews = count > 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-4 text-right">{rating}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${hasReviews ? 'bg-yellow-500' : 'bg-muted'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-10 text-left">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Ethical Policy Averages */}
        <div>
          <h4 className="font-semibold mb-4">{t('reviews.categoryRatings')}</h4>
          <div className="space-y-3">
            {policyEntries.map(([policy, average]) => (
              <div key={policy} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground capitalize">
                  {formatPolicyName(policy)}
                </span>
                <div className="flex items-center gap-2">
                  <StarRating
                    value={average}
                    readonly
                    size="sm"
                  />
                  <span className="text-sm font-medium w-8 text-right">
                    {average.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
