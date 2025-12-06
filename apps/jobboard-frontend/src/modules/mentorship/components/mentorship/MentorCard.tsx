import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import { Star, Users } from "lucide-react";
import { Badge } from "@shared/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@shared/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import type { Mentor } from "@shared/types/mentor";
import { createMentorshipRequest } from "@modules/mentorship/services/mentorship.service";
import { useAuth } from "@/modules/auth/contexts/AuthContext";
import { toast } from "react-toastify";

interface MentorCardProps {
  mentor: Mentor;
  hasRequested?: boolean;
}

const MentorCard = ({ mentor, hasRequested = false }: MentorCardProps) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const isAvailable = mentor.mentees < mentor.capacity;

  const handleRequest = async () => {
    if (!user?.id) {
      toast.error(t('mentorship.card.authRequired') || 'Please log in to send a request');
      return;
    }

    // Check if user already has a pending/active request with this mentor
    try {
      const { getMenteeMentorships } = await import('@modules/mentorship/services/mentorship.service');
      const mentorships = await getMenteeMentorships(user.id);
      const mentorIdNum = parseInt(mentor.id, 10);
      const existingRequest = mentorships.find(
        (m: any) => 
          m.mentorId === mentorIdNum && 
          (m.requestStatus?.toUpperCase() === 'PENDING' || 
           m.requestStatus?.toUpperCase() === 'ACCEPTED' || 
           m.reviewStatus?.toUpperCase() === 'ACTIVE')
      );
      
      if (existingRequest) {
        toast.error(t('mentorship.card.alreadyRequested') || 'You already have a pending or active mentorship request with this mentor.');
        return;
      }
    } catch (err) {
      console.error('Error checking existing requests:', err);
      // Continue with request if check fails
    }

    setIsRequesting(true);
    try {
      await createMentorshipRequest({ mentorId: parseInt(mentor.id, 10) });
      toast.success(t('mentorship.card.requestSent') || 'Mentorship request sent successfully!');
      navigate('/mentorship/my', {
        state: { 
          showSuccess: true, 
          mentorName: mentor.name,
          activeTab: 'pending' // Switch to pending tab
        }
      });
    } catch (err: any) {
      console.error('Error sending mentorship request:', err);
      const errorMessage = err?.response?.data?.message || err?.message || t('mentorship.card.requestError') || 'Failed to send mentorship request';
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
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
        <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{mentor.bio}</p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-semibold">{mentor.rating.toFixed(1)}</span>
          <span className="ml-1 text-sm text-muted-foreground">({mentor.reviews} {t('mentorship.card.reviews')})</span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-2" />
            <span>{t('mentorship.card.mentoring')}: {mentor.mentees}/{mentor.capacity}</span>
          </div>
        </div>
        
        {/* Expertise (from backend) */}
        {mentor.tags && mentor.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
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
            disabled={isRequesting}
          >
            {isRequesting 
              ? (t('mentorship.card.requesting') || 'Sending...')
              : t('mentorship.card.request')
            }
          </Button>
        ) : (
          <Button disabled variant="outline" size="sm" aria-disabled="true">
            {t('mentorship.card.full')}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MentorCard;
