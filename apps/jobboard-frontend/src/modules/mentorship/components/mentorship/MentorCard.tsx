import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Star, Users } from "lucide-react";
import { Badge } from "@shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/ui/avatar";
import { Link } from "react-router-dom";
import type { Mentor } from "@shared/types/mentor";
import type { MentorshipDetailsDTO } from "@shared/types/api.types";
import {
  useMenteeMentorshipsQuery,
} from "@modules/mentorship/services/mentorship.service";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { toast } from "react-toastify";
import MentorshipRequestModal from "./MentorshipRequestModal";

interface MentorCardProps {
  mentor: Mentor;
  hasRequested?: boolean;
}

const MentorCard = ({ mentor, hasRequested = false }: MentorCardProps) => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const menteeMentorshipsQuery = useMenteeMentorshipsQuery(user?.id, Boolean(user?.id));
  const isAvailable = mentor.mentees < mentor.capacity;

  const handleRequest = async () => {
    if (!user?.id) {
      toast.error(t('mentorship.card.authRequired') || 'Please log in to send a request');
      return;
    }

    const mentorIdNum = parseInt(mentor.id, 10);
    if (isNaN(mentorIdNum)) {
      toast.error(t('mentorship.card.requestError') || 'Invalid mentor id');
      return;
    }

    try {
      const menteeMentorships =
        menteeMentorshipsQuery.data ??
        (await menteeMentorshipsQuery.refetch()).data ??
        [];

      const existingRequest = menteeMentorships.find(
        (m: MentorshipDetailsDTO) =>
          m.mentorId === mentorIdNum &&
          (m.requestStatus?.toUpperCase() === 'PENDING' ||
            m.requestStatus?.toUpperCase() === 'ACCEPTED' ||
            m.reviewStatus?.toUpperCase() === 'ACTIVE')
      );

      if (existingRequest) {
        return;
      }

      // Open the request modal
      setIsRequestModalOpen(true);
    } catch (err: unknown) {
      console.error('Error checking existing requests:', err);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={mentor.profileImage} alt={mentor.name} />
            <AvatarFallback>
              {mentor.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-lg">{mentor.name}</CardTitle>
            {mentor.title && (
              <CardDescription className="text-sm">{mentor.title}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{mentor.bio}</p>
        
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-semibold">{mentor.rating.toFixed(1)}</span>
          <span className="ml-1 text-xs text-muted-foreground">({mentor.reviews} {t('mentorship.card.reviews')})</span>
        </div>
        
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-3.5 w-3.5 mr-1.5" />
              <span>{t('mentorship.card.mentoring')}: {mentor.mentees}/{mentor.capacity}</span>
            </div>
            {!isAvailable && (
              <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-700">
                {t('mentorship.card.full', 'Full')}
              </Badge>
            )}
          </div>
          {!isAvailable && (
            <p className="text-xs text-muted-foreground italic">
              {t('mentorship.card.capacityNote', 'This mentor is currently at full capacity')}
            </p>
          )}
        </div>
        
        {/* Expertise (from backend) */}
        {mentor.tags && mentor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {mentor.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {mentor.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{mentor.tags.length - 3} {t('mentorship.card.more')}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link to={`/mentorship/${mentor.id || ''}`}>
            {t('mentorship.card.viewProfile')}
          </Link>
        </Button>
        {hasRequested ? (
          <Button disabled variant="outline" size="sm" aria-disabled="true">
            {t('mentorship.card.requested') || 'Requested'}
          </Button>
        ) : isAvailable ? (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRequest}
          >
            {t('mentorship.card.request')}
          </Button>
        ) : (
          <Button disabled variant="outline" size="sm" aria-disabled="true">
            {t('mentorship.card.full')}
          </Button>
        )}
      </CardFooter>

      {/* Request Mentorship Modal */}
      <MentorshipRequestModal
        open={isRequestModalOpen}
        onOpenChange={setIsRequestModalOpen}
        mentorId={parseInt(mentor.id, 10)}
        mentorName={mentor.name}
        isAvailable={isAvailable}
      />
    </Card>
  );
};

export default MentorCard;
