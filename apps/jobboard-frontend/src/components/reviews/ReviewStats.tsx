import { StarRating } from '@/components/ui/star-rating';
import { Card } from '@/components/ui/card';
import type { ReviewStats as ReviewStatsType } from '@/types/review.types';
import { useTranslation } from 'react-i18next';

interface ReviewStatsProps {
  stats: ReviewStatsType;
}

export function ReviewStats({ stats }: ReviewStatsProps) {
  const { t } = useTranslation('common');

  const getRatingPercentage = (count: number) => {
    if (stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 100);
  };

  const categoryLabels = {
    culture: t('reviews.categories.culture'),
    benefits: t('reviews.categories.benefits'),
    workLifeBalance: t('reviews.categories.workLifeBalance'),
    management: t('reviews.categories.management'),
    careerGrowth: t('reviews.categories.careerGrowth'),
  };

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">{t('reviews.workplaceReviews')}</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-foreground mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              <StarRating value={stats.averageRating} readonly size="md" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t('reviews.basedOn', { count: stats.totalReviews })}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <span className="text-sm font-medium w-6">{rating}</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 transition-all"
                    style={{
                      width: `${getRatingPercentage(
                        stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {getRatingPercentage(
                    stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution]
                  )}
                  %
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Averages */}
        <div>
          <h4 className="font-semibold mb-4">{t('reviews.categoryRatings')}</h4>
          <div className="space-y-3">
            {(Object.keys(stats.categoryAverages) as Array<keyof typeof stats.categoryAverages>).map(
              (category) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {categoryLabels[category]}
                  </span>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={stats.categoryAverages[category]}
                      readonly
                      size="sm"
                    />
                    <span className="text-sm font-medium w-8 text-right">
                      {stats.categoryAverages[category].toFixed(1)}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
