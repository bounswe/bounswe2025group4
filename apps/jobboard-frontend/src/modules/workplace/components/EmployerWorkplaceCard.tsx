/**
 * EmployerWorkplaceCard Component
 * Displays a detailed workplace card for employer's workplace list
 */

import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Card } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { StarRating } from '@shared/components/ui/star-rating';
import { Building2, MapPin, Settings, Users } from 'lucide-react';
import type { WorkplaceBriefResponse } from '@shared/types/workplace.types';
import { useTranslation } from 'react-i18next';
import { translateEthicalTag } from '@shared/utils/ethical-tag-translator';

interface EmployerWorkplaceCardProps {
  workplace: WorkplaceBriefResponse;
  role: string;
  hasPendingRequests?: boolean;
}

export function EmployerWorkplaceCard({
  workplace,
  role,
  hasPendingRequests = false,
}: EmployerWorkplaceCardProps) {
  const navigate = useNavigate();
  const { t } = useTranslation('common');
  const translateEthicalLabel = (label: string) => translateEthicalTag(t, label);
  const translateRole = (roleLabel: string) =>
    t(`workplace.roles.${roleLabel.toLowerCase()}`, { defaultValue: roleLabel });

  const policyEntries =
    workplace.ethicalAverages && Object.keys(workplace.ethicalAverages).length > 0
      ? Object.entries(workplace.ethicalAverages).filter(([, avg]) => avg != null && !isNaN(avg))
      : [];
  const displayedPolicies = policyEntries.slice(0, 4);
  const remainingPolicies = policyEntries.length - displayedPolicies.length;

  return (
    <Card
      className="p-5 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => navigate(`/workplace/${workplace.id}`)}
    >
      <div className="flex flex-col md:flex-row gap-5">
        {/* Logo */}
        <div className="flex-shrink-0">
          {workplace.imageUrl ? (
            <img
              src={workplace.imageUrl}
              alt={workplace.companyName}
              className="h-24 w-24 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-primary" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col md:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-bold mb-1">{workplace.companyName}</h2>
                <Badge variant="secondary" className="text-xs">
                  {translateRole(role)}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <StarRating value={workplace.overallAvg} readonly size="md" showValue />
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{workplace.sector}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{workplace.location}</span>
              </div>
            </div>

            {workplace.shortDescription && (
              <p className="text-muted-foreground mb-3 line-clamp-2">
                {workplace.shortDescription}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" asChild>
                <Link to={`/employer/workplace/${workplace.id}/settings`}>
                  <Settings className="h-4 w-4" />
                  {t('workplace.settings.label', { defaultValue: t('workplace.settings') })}
                </Link>
              </Button>
              <Button variant="outline" asChild className="relative">
                <Link to={`/employer/workplace/${workplace.id}/requests`}>
                  <Users className="h-4 w-4" />
                  {t('workplace.manageRequests')}
                  {hasPendingRequests && (
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-background" />
                  )}
                </Link>
              </Button>
            </div>
          </div>

          {/* Ethical Tag Ratings - Right Side */}
          {policyEntries.length > 0 && (
            <div className="md:w-80 flex-shrink-0 border-l md:border-l md:border-t-0 border-t pl-5 md:pl-5 pt-5 md:pt-0">
              <h4 className="text-xs font-semibold mb-2 text-muted-foreground">
                {t('jobs.detail.ethicalPolicy.ratingsTitle', { defaultValue: 'Ethical Ratings' })}
              </h4>
              <div className="space-y-1.5">
                {displayedPolicies.map(([policy, average]) => (
                  <div key={policy} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-muted-foreground capitalize flex-1">
                      {translateEthicalLabel(policy)}
                    </span>
                    <div className="flex items-center gap-1">
                      <StarRating value={average as number} readonly size="sm" />
                      <span className="text-xs font-medium w-8 text-right">
                        {(average as number).toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
                {remainingPolicies > 0 && (
                  <>
                    <div className="border-t border-border my-2" />
                    <div className="text-xs text-muted-foreground">
                      +{remainingPolicies} {t('common.more', { defaultValue: 'more' })}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
