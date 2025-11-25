import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle, XCircle, MessageCircle, Star, Calendar, FileText } from 'lucide-react';
import type { Mentorship, MentorshipStatus } from '@/types/mentor';
import { useAuth } from '@/contexts/AuthContext';
import { getMenteeMentorships, rateMentor } from '@/services/mentorship.service';
import type { CreateRatingDTO } from '@/types/api.types';
import { convertMentorshipDetailsToMentorship } from '@/utils/mentorship.utils';
import { profileService } from '@/services/profile.service';
import CenteredLoader from '@/components/CenteredLoader';
import CenteredError from '@/components/CenteredError';
import { toast } from 'react-toastify';

const getStatusIcon = (status: MentorshipStatus) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'accepted':
    case 'active':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'completed':
      return <Star className="h-4 w-4 text-blue-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: MentorshipStatus) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'accepted':
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'completed':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MyMentorshipsPage = () => {
  const { t } = useTranslation('common');
  const location = useLocation();
  const { user } = useAuth();
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedMentorshipForReview, setSelectedMentorshipForReview] = useState<Mentorship | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(location.state?.activeTab || 'active');
  
  // Success message from request page
  const showSuccess = location.state?.showSuccess;
  const mentorName = location.state?.mentorName;
  const [newMentorshipFromState] = useState<Mentorship | undefined>(
    location.state?.newMentorship as Mentorship | undefined
  );

  useEffect(() => {
    const fetchMentorships = async () => {
      if (!user?.id) {
        setError(t('mentorship.errors.genericError') || 'User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const backendMentorships = await getMenteeMentorships(user.id);
        
        // Fetch mentor profiles to get avatars
        const mentorProfilesMap: Record<number, string | undefined> = {};
        const uniqueMentorIds = [...new Set(backendMentorships.map(m => m.mentorId))];
        await Promise.all(
          uniqueMentorIds.map(async (mentorId) => {
            try {
              const profile = await profileService.getPublicProfile(mentorId);
              mentorProfilesMap[mentorId] = profile.imageUrl;
            } catch (err) {
              // Profile might not exist, that's okay
              mentorProfilesMap[mentorId] = undefined;
            }
          })
        );
        
        const convertedMentorships = backendMentorships.map((m) => 
          convertMentorshipDetailsToMentorship(m, mentorProfilesMap[m.mentorId])
        );
        
        // Remove duplicates by id and mentorId combination
        const uniqueMentorships = Array.from(
          new Map(convertedMentorships.map(m => [`${m.id}-${m.mentorId}`, m])).values()
        );
        
        let allMentorships = uniqueMentorships;
        if (newMentorshipFromState) {
          const exists = allMentorships.some(m => m.id === newMentorshipFromState.id);
          if (!exists) {
            allMentorships = [newMentorshipFromState, ...allMentorships];
          }
        }
        setMentorships(allMentorships);
      } catch (err) {
        console.error('Error fetching mentorships:', err);
        setError(t('mentorship.errors.loadMentorshipsFailed') || 'Failed to load mentorships. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentorships();
  }, [user?.id, location.pathname, newMentorshipFromState]); // Refetch when pathname changes or new mentorship is passed

  const handleOpenReviewDialog = (mentorship: Mentorship) => {
    setSelectedMentorshipForReview(mentorship);
    setReviewRating(0);
    setReviewComment('');
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedMentorshipForReview || !selectedMentorshipForReview.resumeReviewId) {
      toast.error(t('mentorship.myMentorships.reviewError') || 'Cannot submit review: Review ID not found');
      return;
    }

    if (reviewRating === 0) {
      toast.error(t('mentorship.myMentorships.ratingRequired') || 'Please select a rating');
      return;
    }

    setIsSubmittingReview(true);

    try {
      const reviewData: CreateRatingDTO = {
        resumeReviewId: selectedMentorshipForReview.resumeReviewId,
        rating: reviewRating,
        comment: reviewComment.trim() || '',
      };

      await rateMentor(reviewData);
      toast.success(t('mentorship.myMentorships.reviewSuccess') || 'Review submitted successfully!');
      
      setReviewDialogOpen(false);
      const mentorIdForRefresh = selectedMentorshipForReview.mentorId; // Store before clearing
      setSelectedMentorshipForReview(null);
      setReviewRating(0);
      setReviewComment('');

      // Refetch mentorships to update data
      if (user?.id) {
        const updatedMentorships = await getMenteeMentorships(user.id);
        
        // Fetch mentor profiles to get avatars
        const mentorProfilesMap: Record<number, string | undefined> = {};
        const uniqueMentorIds = [...new Set(updatedMentorships.map(m => m.mentorId))];
        await Promise.all(
          uniqueMentorIds.map(async (mentorId) => {
            try {
              const profile = await profileService.getPublicProfile(mentorId);
              mentorProfilesMap[mentorId] = profile.imageUrl;
            } catch (err) {
              mentorProfilesMap[mentorId] = undefined;
            }
          })
        );
        
        const converted = updatedMentorships.map((m) => 
          convertMentorshipDetailsToMentorship(m, mentorProfilesMap[m.mentorId])
        );
        // Remove duplicates by id and mentorId combination
        const uniqueMentorships = Array.from(
          new Map(converted.map(m => [`${m.id}-${m.mentorId}`, m])).values()
        );
        setMentorships(uniqueMentorships);
        
        // Keep on completed tab after review
        setActiveTab('completed');
      }
      
      // Trigger a refresh of the mentor profile page if it's open
      // This will make the review appear on the mentor's profile
      // Pass the mentor ID so the profile page knows which profile to refresh
      window.dispatchEvent(new CustomEvent('mentorProfileRefresh', { 
        detail: { mentorId: mentorIdForRefresh } 
      }));
    } catch (err: any) {
      console.error('Error submitting review:', err);
      const errorMessage = err?.response?.data?.message || err?.message || t('mentorship.errors.reviewFailed') || 'Failed to submit review. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return <CenteredError message={error} />;
  }

  const activeMentorships = mentorships.filter(m => m.status === 'active');
  const pendingMentorships = mentorships.filter(m => m.status === 'pending');
  const completedMentorships = mentorships.filter(m => m.status === 'completed');
  const rejectedMentorships = mentorships.filter(m => m.status === 'rejected');

  const MentorshipCard = ({ mentorship }: { mentorship: Mentorship }) => (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-12 h-12 ring-2 ring-blue-100 dark:ring-blue-900">
              <AvatarImage src={mentorship.mentorAvatar} alt={mentorship.mentorName} />
              <AvatarFallback>
                {mentorship.mentorName.split(' ').map(n => n[0]?.toUpperCase() || '').join('')}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 p-1 bg-blue-500 rounded-full">
              <MessageCircle className="h-3 w-3 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{mentorship.mentorName}</h3>
              <Badge className={`text-xs ${getStatusColor(mentorship.status)}`}>
                {getStatusIcon(mentorship.status)}
                <span className="ml-1 capitalize">{t(`mentorship.myMentorships.status.${mentorship.status}`)}</span>
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{mentorship.mentorTitle}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Your mentorship with this mentor
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{t('mentorship.myMentorships.started')}: {new Date(mentorship.createdAt).toLocaleDateString()}</span>
          </div>
          
          {mentorship.acceptedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <span>{t('mentorship.myMentorships.accepted')}: {new Date(mentorship.acceptedAt).toLocaleDateString()}</span>
            </div>
          )}
          
          {mentorship.completedAt && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>{t('mentorship.myMentorships.completed')}: {new Date(mentorship.completedAt).toLocaleDateString()}</span>
            </div>
          )}
          
        </div>

        <div className="flex gap-2 pt-2">
          {mentorship.status === 'active' && (
            <>
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/chat?mentorshipId=${mentorship.id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('mentorship.myMentorships.openChat')}
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link to={`/mentorship/${mentorship.mentorId}`}>
                  {t('mentorship.myMentorships.viewProfile') || 'View Profile'}
                </Link>
              </Button>
              {mentorship.resumeReviewId && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    asChild
                  >
                    <Link to={`/resume-review/${mentorship.resumeReviewId}`}>
                      <FileText className="h-4 w-4 mr-2" />
                      {t('mentorship.myMentorships.uploadResume') || 'Upload Resume'}
                    </Link>
                  </Button>
                </>
              )}
            </>
          )}
          
          {mentorship.status === 'completed' && (
            <>
              <Button size="sm" className="flex-1" asChild>
                <Link to={`/chat?mentorshipId=${mentorship.id}`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('mentorship.myMentorships.openChat')}
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link to={`/mentorship/${mentorship.mentorId}`}>
                  {t('mentorship.myMentorships.viewProfile') || 'View Profile'}
                </Link>
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => handleOpenReviewDialog(mentorship)}
              >
                <Star className="h-4 w-4 mr-2" />
                {t('mentorship.myMentorships.writeReview')}
              </Button>
            </>
          )}
          
          {mentorship.status === 'pending' && (
            <>
              <Button size="sm" variant="outline" className="flex-1" asChild>
                <Link to={`/mentorship/${mentorship.mentorId}`}>
                  {t('mentorship.myMentorships.viewProfile') || 'View Profile'}
                </Link>
              </Button>
              <Button size="sm" variant="outline" disabled className="flex-1">
                <Clock className="h-4 w-4 mr-2" />
                {t('mentorship.myMentorships.waitingForResponse')}
              </Button>
            </>
          )}
          
          {mentorship.status === 'rejected' && (
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link to={`/mentorship/${mentorship.mentorId}`}>
                {t('mentorship.myMentorships.viewProfile') || 'View Profile'}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground lg:text-4xl mb-2">
                {t('mentorship.myMentorships.title')}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {t('mentorship.myMentorships.subtitle')}
              </p>
            </div>
          </div>
        
        {showSuccess && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700">
              {t('mentorship.myMentorships.successMessage', { mentorName })}
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            {t('mentorship.myMentorships.active')} ({activeMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            {t('mentorship.myMentorships.pending')} ({pendingMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            {t('mentorship.myMentorships.completed')} ({completedMentorships.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t('mentorship.myMentorships.rejected')} ({rejectedMentorships.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.myMentorships.noActive')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('mentorship.myMentorships.noActiveDesc')}
                </p>
                <Button asChild>
                  <Link to="/mentorship">{t('mentorship.myMentorships.findMentors')}</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.myMentorships.noPending')}</h3>
                <p className="text-muted-foreground">
                  {t('mentorship.myMentorships.noPendingDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.myMentorships.noCompleted')}</h3>
                <p className="text-muted-foreground">
                  {t('mentorship.myMentorships.noCompletedDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedMentorships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rejectedMentorships.map((mentorship) => (
                <MentorshipCard key={mentorship.id} mentorship={mentorship} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.myMentorships.noRejected')}</h3>
                <p className="text-muted-foreground">
                  {t('mentorship.myMentorships.noRejectedDesc')}
                </p>
              </CardContent>
            </Card>
          )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('mentorship.myMentorships.reviewTitle', 'Write a Review')}</DialogTitle>
            <DialogDescription>
              {t('mentorship.myMentorships.reviewDescription', { 
                mentorName: selectedMentorshipForReview?.mentorName || 'your mentor',
                defaultValue: 'Share your experience with {{mentorName}}'
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Rating */}
            <div className="space-y-2">
              <Label>{t('mentorship.myMentorships.rating', 'Rating')} *</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewRating(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        rating <= reviewRating
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <p className="text-sm text-muted-foreground">
                  {reviewRating === 1 && t('mentorship.myMentorships.rating1', 'Poor')}
                  {reviewRating === 2 && t('mentorship.myMentorships.rating2', 'Fair')}
                  {reviewRating === 3 && t('mentorship.myMentorships.rating3', 'Good')}
                  {reviewRating === 4 && t('mentorship.myMentorships.rating4', 'Very Good')}
                  {reviewRating === 5 && t('mentorship.myMentorships.rating5', 'Excellent')}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-2">
              <Label htmlFor="review-comment">
                {t('mentorship.myMentorships.comment', 'Comment')} (Optional)
              </Label>
              <Textarea
                id="review-comment"
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder={t('mentorship.myMentorships.commentPlaceholder', 'Share your experience...')}
                rows={4}
                maxLength={1000}
              />
              <p className="text-xs text-muted-foreground">
                {reviewComment.length}/1000 {t('mentorship.myMentorships.characters', 'characters')}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setReviewRating(0);
                setReviewComment('');
              }}
              disabled={isSubmittingReview}
            >
              {t('mentorship.myMentorships.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || isSubmittingReview}
            >
              {isSubmittingReview ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('mentorship.myMentorships.submitting', 'Submitting...')}
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  {t('mentorship.myMentorships.submitReview', 'Submit Review')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyMentorshipsPage;
