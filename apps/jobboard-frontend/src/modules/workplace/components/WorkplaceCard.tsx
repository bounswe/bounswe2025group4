/**
 * WorkplaceCard Component
 * Displays a workplace summary card with rating and basic info
 */

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@shared/components/ui/card';
import { StarRating } from '@shared/components/ui/star-rating';
import { Badge } from '@shared/components/ui/badge';
import { MapPin, Building2 } from 'lucide-react';
import type { WorkplaceBriefResponse } from '@shared/types/workplace.types';

interface WorkplaceCardProps {
  workplace: WorkplaceBriefResponse;
  onClick?: () => void;
}

export function WorkplaceCard({ workplace, onClick }: WorkplaceCardProps) {
  const cardContent = (
    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent>
        <div className="flex gap-4">
          {/* Image/Logo */}
          <div className="flex-shrink-0">
            {workplace.imageUrl ? (
              <img
                src={workplace.imageUrl}
                alt={workplace.companyName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1 truncate">
              {workplace.companyName}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <StarRating value={workplace.overallAvg} readonly size="sm" showValue />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
              <Building2 className="w-4 h-4" />
              <span>{workplace.sector}</span>
              <span>•</span>
              <MapPin className="w-4 h-4" />
              <span>{workplace.location}</span>
            </div>

            {workplace.shortDescription && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {workplace.shortDescription}
              </p>
            )}

            {/* Ethical Tags */}
            {workplace.ethicalTags && workplace.ethicalTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {workplace.ethicalTags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {workplace.ethicalTags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{workplace.ethicalTags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // If onClick is provided, don't wrap in Link
  if (onClick) {
    return cardContent;
  }

  // Default behavior: wrap in Link for navigation
  return <Link to={`/workplace/${workplace.id}`}>{cardContent}</Link>;
}
