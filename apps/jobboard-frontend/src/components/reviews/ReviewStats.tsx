import { StarRating } from '@/components/ui/star-rating';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

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
}

export function ReviewStats({ overallAvg, ethicalAverages, ethicalTags = [], totalReviews = 0, ratingDistribution }: ReviewStatsProps) {
  const { t } = useTranslation('common');
  
  // Default rating distribution with all zeros
  const defaultDistribution = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  
  // Use provided distribution or default to all zeros
  const distribution = ratingDistribution || defaultDistribution;

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

  // Handle null/undefined overallAvg
  const safeOverallAvg = overallAvg != null && !isNaN(overallAvg) ? overallAvg : 0;

  // Calculate total reviews from distribution
  const totalFromDistribution = Object.values(distribution).reduce((sum, count) => sum + (count || 0), 0);
  const effectiveTotalReviews = totalReviews || totalFromDistribution;

  // Calculate percentages for distribution
  const getPercentage = (count: number) => {
    return effectiveTotalReviews > 0 ? Math.round((count / effectiveTotalReviews) * 100) : 0;
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
                const count = distribution[rating as keyof typeof distribution] || 0;
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
