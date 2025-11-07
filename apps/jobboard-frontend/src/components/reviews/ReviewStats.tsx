import { StarRating } from '@/components/ui/star-rating';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface ReviewStatsProps {
  overallAvg: number;
  ethicalAverages: Record<string, number>;
  totalReviews?: number;
}

export function ReviewStats({ overallAvg, ethicalAverages, totalReviews = 0 }: ReviewStatsProps) {
  const { t } = useTranslation('common');

  // Convert policy names to readable format
  const formatPolicyName = (policy: string) => {
    return policy.replace(/([A-Z])/g, ' $1').trim();
  };

  const policyEntries = Object.entries(ethicalAverages);

  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold mb-6">{t('reviews.workplaceReviews')}</h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Overall Rating */}
        <div>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-foreground mb-2">
              {overallAvg.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              <StarRating value={overallAvg} readonly size="md" />
            </div>
            {totalReviews > 0 && (
              <p className="text-sm text-muted-foreground">
                {t('reviews.basedOn', { count: totalReviews })}
              </p>
            )}
          </div>

          {overallAvg === 0 && (
            <div className="text-center text-muted-foreground">
              <p className="text-sm">{t('reviews.noReviewsYet')}</p>
            </div>
          )}
        </div>

        {/* Ethical Policy Averages */}
        {policyEntries.length > 0 && (
          <div>
            <h4 className="font-semibold mb-4">{t('reviews.ethicalPolicyRatings')}</h4>
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
        )}

        {policyEntries.length === 0 && overallAvg > 0 && (
          <div className="flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{t('reviews.noPolicyRatings')}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
