import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { Badge } from '@shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { Star, ArrowLeft, Send, Clock, Users, AlertCircle } from 'lucide-react';
import type { Mentor, Mentorship } from '@shared/types/mentor';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import {
  useMentorProfileQuery,
  useCreateMentorshipRequestMutation,
  useMenteeMentorshipsQuery,
} from '@modules/mentorship/services/mentorship.service';
import { convertMentorProfileToMentor } from '@shared/utils/mentorship.utils';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';
import { toast } from 'react-toastify';
import { normalizeApiError } from '@shared/utils/error-handler';

const MentorshipRequestPage = () => {
  const { t } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    motivation: ''
  });
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const mentorId = id ? parseInt(id, 10) : undefined;
  const mentorProfileQuery = useMentorProfileQuery(mentorId, Boolean(mentorId));
  const menteeMentorshipsQuery = useMenteeMentorshipsQuery(user?.id, Boolean(user?.id));
  const createRequestMutation = useCreateMentorshipRequestMutation();
  const isLoading =
    mentorProfileQuery.isLoading ||
    menteeMentorshipsQuery.isLoading;


  useEffect(() => {
    if (mentorProfileQuery.data) {
      setMentor(convertMentorProfileToMentor(mentorProfileQuery.data));
    }
    if (mentorProfileQuery.error) {
      const normalized = normalizeApiError(mentorProfileQuery.error, 'Failed to load mentor profile.');
      setError(normalized.friendlyMessage);
    } else {
      setError(null);
    }
  }, [mentorProfileQuery.data, mentorProfileQuery.error]);

  useEffect(() => {
    if (menteeMentorshipsQuery.data && mentorId) {
      const hasExisting = menteeMentorshipsQuery.data.some(
        (m) =>
          m.mentorId === mentorId &&
          (m.requestStatus === 'PENDING' ||
            m.requestStatus === 'ACCEPTED' ||
            m.reviewStatus === 'ACTIVE')
      );
      setHasExistingRequest(hasExisting);
    }
  }, [menteeMentorshipsQuery.data, mentorId]);

  const isAvailable = mentor ? mentor.mentees < mentor.capacity : false;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentor || !id) {
      toast.error(t('mentorship.request.mentorInfoMissing') || 'Mentor information is missing');
      return;
    }

    if (hasExistingRequest) {
      return;
    }

    // Validate motivation field
    const motivation = formData.motivation.trim();
    if (!motivation) {
      toast.error(t('mentorship.request.motivationRequired') || 'Please provide a motivation message for your mentorship request.');
      return;
    }

    try {
      if (!user?.id) {
        toast.error(
          t('mentorship.request.userNotAuthenticated') ||
            'You must be logged in to send a mentorship request'
        );
        return;
      }

      const mentorIdParsed = parseInt(id, 10);
      if (isNaN(mentorIdParsed)) {
        navigate('/mentorship/browse');
        return;
      }

      const response = await createRequestMutation.mutateAsync({ 
        mentorId: mentorIdParsed,
        motivation: motivation
      });

      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }

      const newMentorship: Mentorship = {
        id: response.id,
        mentorId: response.mentorId,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        mentorAvatar: mentor.profileImage,
        menteeId: user?.id?.toString() || '',
        menteeName: 'You',
        status:
          response.status === 'PENDING'
            ? 'pending'
            : response.status === 'ACCEPTED'
              ? 'active'
              : response.status === 'REJECTED'
                ? 'rejected'
                : 'pending',
        createdAt: new Date().toISOString(),
        acceptedAt: undefined,
        completedAt: undefined,
        goals: [],
        message: formData.motivation || 'No motivation provided',
        preferredTime: 'Flexible',
        expectedDuration: 'Flexible',
        conversationId: undefined,
      };

      navigate('/mentorship/my', {
        state: {
          showSuccess: true,
          mentorName: mentor.name,
          newMentorship,
        },
      });
    } catch (err: any) {
      console.error('Error sending mentorship request:', err);
      const normalized = normalizeApiError(
        err,
        t('mentorship.request.errorMessage') ||
          'Failed to send mentorship request. Please try again.'
      );
      toast.error(normalized.friendlyMessage);
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return <CenteredError message={error} />;
  }

  if (!mentor) {
    return <CenteredError message={t('mentorship.profile.notFound')} />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/mentorship/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('mentorship.request.backToProfile')}
        </Button>
        
        <h1 className="text-3xl font-bold">{t('mentorship.request.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('mentorship.request.subtitle', { mentorName: mentor.name })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mentor Info */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={mentor.profileImage} alt={mentor.name} />
                  <AvatarFallback>
                    {mentor.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{mentor.name}</h3>
                  <p className="text-sm text-muted-foreground">{mentor.title}</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating */}
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-semibold">{mentor.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">({mentor.reviews} {t('mentorship.request.reviews')})</span>
              </div>
              
              {/* Capacity */}
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t('mentorship.request.mentoring')}:</span>
                <span className="font-semibold">{mentor.mentees}/{mentor.capacity}</span>
              </div>
              
              {/* Availability */}
              {mentor.availability && (
                <div className="flex items-start gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground block mb-1">Availability:</span>
                    <span className="text-foreground">{mentor.availability}</span>
                  </div>
                </div>
              )}
              
              {/* Hourly Rate */}
              {mentor.hourlyRate && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-semibold">${mentor.hourlyRate}/hour</span>
                </div>
              )}
              
              {/* Specialties */}
              <div>
                <h4 className="font-semibold mb-2 text-sm">{t('mentorship.request.specialties')}:</h4>
                <div className="flex flex-wrap gap-2">
                  {mentor.specialties && mentor.specialties.length > 0 ? (
                    mentor.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">No specialties specified</span>
                  )}
                </div>
              </div>
              
              {/* Languages */}
              {mentor.languages && mentor.languages.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Languages:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((language) => (
                      <Badge key={language} variant="outline" className="text-xs">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Social Links */}
              {(mentor.linkedinUrl || mentor.githubUrl || mentor.websiteUrl) && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Connect:</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.linkedinUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={mentor.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-xs">
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {mentor.githubUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={mentor.githubUrl} target="_blank" rel="noopener noreferrer" className="text-xs">
                          GitHub
                        </a>
                      </Button>
                    )}
                    {mentor.websiteUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={mentor.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs">
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Availability Warning */}
              {!isAvailable && (
                <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {t('mentorship.request.fullCapacity')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Request Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('mentorship.request.formTitle')}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t('mentorship.request.formDescription')}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* Motivation */}
                <div className="space-y-2">
                  <Label htmlFor="motivation" className="text-sm font-semibold">
                    {t('mentorship.request.motivationLabel') || 'Motivation'} *
                  </Label>
                  <Textarea
                    id="motivation"
                    placeholder={t('mentorship.request.motivationPlaceholder') || 'Please explain why you want to be mentored by this mentor and what you hope to achieve...'}
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    rows={8}
                    disabled={!isAvailable || hasExistingRequest}
                    className="resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('mentorship.request.motivationHint') || 'Share your goals, expectations, and what you hope to learn from this mentorship.'}
                  </p>
                </div>


                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/mentorship/${id}`)}
                    className="flex-1"
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      !isAvailable || createRequestMutation.isPending || hasExistingRequest
                    }
                    className="flex-1"
                    size="lg"
                  >
                    {createRequestMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        {t('mentorship.request.sendingRequest') || 'Sending Request...'}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {t('mentorship.request.sendRequest') || 'Send Request'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MentorshipRequestPage;
