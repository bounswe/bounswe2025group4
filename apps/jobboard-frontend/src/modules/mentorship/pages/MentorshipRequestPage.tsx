import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { Badge } from '@shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { Checkbox } from '@shared/components/ui/checkbox';
import { Star, ArrowLeft, Send, Clock, Users, AlertCircle } from 'lucide-react';
import type { Mentor, Mentorship } from '@shared/types/mentor';
import { useAuth } from '@shared/contexts/AuthContext';
import { getMentorProfile, createMentorshipRequest, getMenteeMentorships } from '@modules/mentorship/services/mentorship.service';
import { convertMentorProfileToMentor } from '@shared/utils/mentorship.utils';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';
import { toast } from 'react-toastify';

const MentorshipRequestPage = () => {
  const { t } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    message: '',
    goals: '',
    preferredTime: ''
  });
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [timeRange, setTimeRange] = useState({ start: '', end: '' });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);

  const daysOfWeek = useMemo(() => [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ], []);

  // Update preferredTime string when days or time changes
  useEffect(() => {
    const daysText = selectedDays.length > 0 
      ? selectedDays.map(d => {
          const day = daysOfWeek.find(day => day.value === d);
          return day ? day.label : d;
        }).join(', ')
      : '';
    const timeText = timeRange.start && timeRange.end
      ? `${timeRange.start} - ${timeRange.end}`
      : timeRange.start || timeRange.end || '';
    
    const preferredTimeText = [daysText, timeText].filter(Boolean).join(' | ');
    setFormData(prev => ({ ...prev, preferredTime: preferredTimeText || '' }));
  }, [selectedDays, timeRange, daysOfWeek]);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!id) {
        setError('Mentor ID is missing');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const mentorId = parseInt(id, 10);
        if (isNaN(mentorId)) {
          throw new Error('Invalid mentor ID');
        }

        const backendMentor = await getMentorProfile(mentorId);
        if (!backendMentor) {
          throw new Error('Mentor profile not found');
        }
        const convertedMentor = convertMentorProfileToMentor(backendMentor);
        setMentor(convertedMentor);

        // Check if user already has a pending/active request for this mentor
        if (user?.id) {
          try {
            const existingMentorships = await getMenteeMentorships(user.id);
            const hasExisting = existingMentorships.some(
              m => m.mentorId === mentorId && 
                   (m.requestStatus === 'PENDING' || 
                    m.requestStatus === 'ACCEPTED' ||
                    m.reviewStatus === 'ACTIVE') // Active mentorship means you already have an active relationship
            );
            setHasExistingRequest(hasExisting);
          } catch (err) {
            console.error('Error checking existing requests:', err);
            // Don't block the page if this check fails
          }
        }
      } catch (err) {
        console.error('Error fetching mentor profile:', err);
        setError('Failed to load mentor profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorProfile();
  }, [id, user?.id]);

  const isAvailable = mentor ? mentor.mentees < mentor.capacity : false;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentor || !id) {
      toast.error(t('mentorship.request.mentorInfoMissing') || 'Mentor information is missing');
      return;
    }

    if (hasExistingRequest) {
      toast.error(t('mentorship.request.alreadyExists') || 'You already have a pending or accepted request for this mentor.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (!user?.id) {
        toast.error(t('mentorship.request.userNotAuthenticated') || 'You must be logged in to send a mentorship request');
        setIsSubmitting(false);
        return;
      }

      const mentorId = parseInt(id, 10);
      if (isNaN(mentorId)) {
        throw new Error('Invalid mentor ID');
      }

      // Double-check before sending (in case state wasn't updated)
      try {
        const existingMentorships = await getMenteeMentorships(user.id);
        const hasExisting = existingMentorships.some(
          m => m.mentorId === mentorId && 
               (m.requestStatus === 'PENDING' || 
                m.requestStatus === 'ACCEPTED' ||
                m.reviewStatus === 'ACTIVE') // Active mentorship means you already have an active relationship
        );
        if (hasExisting) {
          toast.error(t('mentorship.request.alreadyExists') || 'You already have a pending, accepted, or active mentorship with this mentor.');
          setIsSubmitting(false);
          setHasExistingRequest(true);
          return;
        }
      } catch (checkErr) {
        console.error('Error checking existing requests before submit:', checkErr);
        // Continue with submission if check fails
      }

      const response = await createMentorshipRequest({ mentorId });
      
      if (!response || !response.id) {
        throw new Error('Invalid response from server');
      }
      
      toast.success(t('mentorship.request.successMessage') || 'Mentorship request sent successfully!');
      
      const newMentorship: Mentorship = {
        id: response.id,
        mentorId: response.mentorId,
        mentorName: mentor.name,
        mentorTitle: mentor.title,
        mentorAvatar: mentor.profileImage,
        menteeId: user?.id?.toString() || '',
        menteeName: 'You',
        status: response.status === 'PENDING' ? 'pending' : 
                response.status === 'ACCEPTED' ? 'active' : 
                response.status === 'REJECTED' ? 'rejected' : 'pending',
        createdAt: new Date().toISOString(),
        acceptedAt: undefined,
        completedAt: undefined,
        goals: formData.goals ? formData.goals.split('\n').filter(g => g.trim()) : [],
        message: formData.message || 'No message provided',
        preferredTime: formData.preferredTime || 'Flexible',
        expectedDuration: 'Flexible', // Removed from form, default to Flexible
        conversationId: undefined,
      };
      
      // Success - Redirect to my mentorships page with the new request
      navigate('/my-mentorships', { 
        state: { 
          showSuccess: true,
          mentorName: mentor.name,
          newMentorship: newMentorship // Pass the new request to show it immediately
        }
      });
    } catch (err: any) {
      console.error('Error sending mentorship request:', err);
      
      // More detailed error handling
      let errorMessage = t('mentorship.request.errorMessage') || 'Failed to send mentorship request. Please try again.';
      
      if (err?.response) {
        // API error response
        const status = err.response.status;
        const data = err.response.data;
        
        console.error('API Error Response:', { status, data });
        
        if (status === 400) {
          errorMessage = data?.message || 'Invalid request. Please check your input.';
        } else if (status === 401) {
          errorMessage = 'You must be logged in to send a mentorship request.';
        } else if (status === 403) {
          errorMessage = 'You do not have permission to send this request.';
        } else if (status === 404) {
          errorMessage = 'Mentor not found.';
        } else if (status === 409) {
          errorMessage = data?.message || 'A mentorship request already exists for this mentor.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = data?.message || errorMessage;
        }
      } else if (err?.request) {
        // Network error (no response received)
        console.error('Network Error:', err.request);
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (err?.message) {
        // Other error
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
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
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-sm font-semibold">
                    {t('mentorship.request.messageLabel')} *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={t('mentorship.request.messagePlaceholder')}
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    rows={6}
                    required
                    disabled={!isAvailable || hasExistingRequest}
                    className="resize-y"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('mentorship.request.messageHint')}
                  </p>
                </div>

                {/* Goals */}
                <div className="space-y-2">
                  <Label htmlFor="goals" className="text-sm font-semibold">
                    {t('mentorship.request.goalsLabel')} *
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder={t('mentorship.request.goalsPlaceholder')}
                    value={formData.goals}
                    onChange={(e) => handleInputChange('goals', e.target.value)}
                    rows={5}
                    required
                    disabled={!isAvailable || hasExistingRequest}
                    className="resize-y font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('mentorship.request.goalsHint')}
                  </p>
                </div>

                {/* Preferred Meeting Time (like availability) */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">
                    {t('mentorship.request.timeLabel')}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t('mentorship.request.timeHint') || 'Select your preferred days and time for mentorship sessions'}
                  </p>
                  
                  {/* Select Available Days */}
                  <div>
                    <Label className="text-xs font-medium mb-2 block">
                      {t('mentorship.createMentorProfile.selectDays') || 'Select Available Days'}
                    </Label>
                    <div className="flex flex-wrap gap-3">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`day-${day.value}`}
                            checked={selectedDays.includes(day.value)}
                            onCheckedChange={() => handleDayToggle(day.value)}
                            disabled={!isAvailable || hasExistingRequest}
                          />
                          <Label
                            htmlFor={`day-${day.value}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeStart" className="text-xs font-medium mb-1 block">
                        {t('mentorship.createMentorProfile.timeStart') || 'Start Time'}
                      </Label>
                      <Input
                        id="timeStart"
                        type="time"
                        value={timeRange.start}
                        onChange={(e) => setTimeRange(prev => ({ ...prev, start: e.target.value }))}
                        disabled={!isAvailable || hasExistingRequest}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timeEnd" className="text-xs font-medium mb-1 block">
                        {t('mentorship.createMentorProfile.timeEnd') || 'End Time'}
                      </Label>
                      <Input
                        id="timeEnd"
                        type="time"
                        value={timeRange.end}
                        onChange={(e) => setTimeRange(prev => ({ ...prev, end: e.target.value }))}
                        disabled={!isAvailable || hasExistingRequest}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Warning if already has request */}
                {hasExistingRequest && (
                  <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                          {t('mentorship.request.alreadyExists')}
                        </p>
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          You already have a pending or active mentorship request with this mentor. Please check your mentorships page.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/mentorship/${id}`)}
                    className="flex-1"
                  >
                    {t('mentorship.request.cancel')}
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isAvailable || isSubmitting || hasExistingRequest}
                    className="flex-1"
                    size="lg"
                  >
                    {isSubmitting ? (
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
