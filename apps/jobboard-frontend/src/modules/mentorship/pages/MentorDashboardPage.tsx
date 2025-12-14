import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { CheckCircle, MessageCircle, Star, FileText, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@shared/components/ui/dialog';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import {
  useMentorProfileQuery,
  useMentorMentorshipRequestsQuery,
  useRespondToMentorshipRequestMutation,
  useDeleteMentorProfileMutation,
  getMenteeMentorships,
} from '@modules/mentorship/services/mentorship.service';
import { profileService } from '@modules/profile/services/profile.service';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import { toast } from 'react-toastify';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryClient } from '@tanstack/react-query';
import { mentorshipKeys } from '@shared/lib/query-keys';
import type { MentorshipDetailsDTO, MentorshipRequestDTO } from '@shared/types/api.types';
import { convertMentorshipDetailsToMentorship } from '@shared/utils/mentorship.utils';
import type { Mentorship } from '@shared/types/mentor';

const MentorDashboardPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const mentorProfileQuery = useMentorProfileQuery(user?.id, Boolean(user?.id));
  const mentorRequestsQuery = useMentorMentorshipRequestsQuery(user?.id, Boolean(user?.id && mentorProfileQuery.data));
  const respondMutation = useRespondToMentorshipRequestMutation();
  const deleteMentorProfileMutation = useDeleteMentorProfileMutation(user?.id || 0);
  
  const [mentorMentorships, setMentorMentorships] = useState<Mentorship[]>([]);
  const [isLoadingMentorMentorships, setIsLoadingMentorMentorships] = useState(false);
  const [requests, setRequests] = useState<MentorshipRequestDTO[]>([]);
  const [menteeProfiles, setMenteeProfiles] = useState<Record<string, any>>({});
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [mentorName, setMentorName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Load mentor name from profile
  useEffect(() => {
    const loadMentorName = async () => {
      if (!user?.id) return;
      try {
        const profile = await profileService.getPublicProfile(user.id);
        const name = `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || user.username || 'Mentor';
        setMentorName(name);
      } catch (err) {
        console.error('Error loading mentor name:', err);
        setMentorName(user.username || 'Mentor');
      }
    };
    loadMentorName();
  }, [user?.id, user?.username]);

  // Load mentor requests and mentee profiles
  useEffect(() => {
    if (!mentorRequestsQuery.data) return;
    
    setRequests(mentorRequestsQuery.data);
    const uniqueRequesterIds = [...new Set(mentorRequestsQuery.data.map((r) => r.requesterId))];
    const profiles: Record<string, any> = {};
    
    Promise.all(
      uniqueRequesterIds.map(async (requesterId) => {
        try {
          const requesterIdNum = parseInt(requesterId, 10);
          if (!isNaN(requesterIdNum)) {
            const profile = await profileService.getPublicProfile(requesterIdNum);
            profiles[requesterId] = profile;
          }
        } catch (err) {
          console.error(`Error fetching profile for requester ${requesterId}:`, err);
        }
      })
    ).then(() => setMenteeProfiles(profiles));
  }, [mentorRequestsQuery.data]);

  // Load mentor's own mentorships
  useEffect(() => {
    const hydrateMentorMentorships = async () => {
      if (!mentorProfileQuery.data || !user?.id || !mentorRequestsQuery.data) return;

      try {
        setIsLoadingMentorMentorships(true);
        const acceptedRequests = mentorRequestsQuery.data.filter(
          (r) => r.status?.toUpperCase() === 'ACCEPTED'
        );

        const allMentorMentorships: Mentorship[] = [];
        const menteeProfilesMap: Record<number, string | undefined> = {};

        for (const request of acceptedRequests) {
          const requesterIdNum = parseInt(request.requesterId, 10);
          if (isNaN(requesterIdNum)) continue;

          try {
            const menteeMentorships = await queryClient.fetchQuery<MentorshipDetailsDTO[]>({
              queryKey: mentorshipKeys.menteeMentorships(requesterIdNum),
              queryFn: () => getMenteeMentorships(requesterIdNum),
            });

            const matchingMentorship = menteeMentorships.find(
              (m) => m.mentorId === user.id
            );

            if (matchingMentorship) {
              if (!menteeProfilesMap[requesterIdNum]) {
                try {
                  const profile = await profileService.getPublicProfile(requesterIdNum);
                  menteeProfilesMap[requesterIdNum] = profile.imageUrl;
                } catch (err) {
                  menteeProfilesMap[requesterIdNum] = undefined;
                }
              }

              const mentorship = convertMentorshipDetailsToMentorship(
                matchingMentorship,
                menteeProfilesMap[requesterIdNum]
              );
              
              const menteeProfile = menteeProfiles[request.requesterId] || menteeProfiles[String(requesterIdNum)];
              
              if (menteeProfile) {
                mentorship.mentorName = `${menteeProfile.firstName} ${menteeProfile.lastName}`.trim() || menteeProfile.firstName || `Mentee ${requesterIdNum}`;
                mentorship.mentorAvatar = menteeProfile.imageUrl;
                mentorship.mentorTitle = menteeProfile.bio || 'Mentee';
              } else {
                mentorship.mentorName = `Mentee ${requesterIdNum}`;
                mentorship.mentorTitle = 'Mentee';
              }

              allMentorMentorships.push(mentorship);
            }
          } catch (err) {
            console.error(`Error fetching mentorships for requester ${requesterIdNum}:`, err);
          }
        }

        setMentorMentorships(allMentorMentorships);
      } catch (err) {
        console.error('Error hydrating mentor mentorships:', err);
      } finally {
        setIsLoadingMentorMentorships(false);
      }
    };

    hydrateMentorMentorships();
  }, [mentorProfileQuery.data, user?.id, mentorRequestsQuery.data, menteeProfiles, queryClient]);

  const handleRespond = async (requestId: string, accept: boolean) => {
    if (!user?.id) {
      toast.error(t('mentorship.mentorRequests.authRequired') || 'You must be logged in to respond to requests.');
      return;
    }
    const requestIdNum = parseInt(requestId, 10);
    if (isNaN(requestIdNum)) {
      toast.error(t('mentorship.mentorRequests.responseError') || 'Invalid request ID.');
      return;
    }

    setRespondingTo(requestId);
    try {
      await respondMutation.mutateAsync({ 
        requestId: requestIdNum, 
        accept,
        responseMessage: accept ? 'Mentorship request accepted' : 'Mentorship request declined',
      });

      await mentorRequestsQuery.refetch();
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentorRequests('me') });
      
      // Toast is already shown in mutation's onSuccess callback
    } catch (err: unknown) {
      console.error('Error responding to request:', err);
      const normalized = normalizeApiError(err, 'Failed to respond to request');
      toast.error(normalized.friendlyMessage);
    } finally {
      setRespondingTo(null);
    }
  };

  const handleDeleteProfile = async () => {
    if (!user?.id || isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteMentorProfileMutation.mutateAsync();
      setDeleteDialogOpen(false);
      // Clear all mentorship-related cache
      queryClient.removeQueries({ queryKey: mentorshipKeys.all });
      queryClient.invalidateQueries({ queryKey: mentorshipKeys.mentors });
      // Navigate to home or my mentorships page
      navigate('/mentorship/my');
    } catch (err: unknown) {
      console.error('Error deleting mentor profile:', err);
      const normalized = normalizeApiError(err, 'Failed to delete mentor profile');
      toast.error(normalized.friendlyMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (mentorProfileQuery.isLoading || mentorRequestsQuery.isLoading) {
    return <CenteredLoader />;
  }

  if (!mentorProfileQuery.data) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {t('mentorship.dashboard.noMentorProfile', 'You need to create a mentor profile first.')}
            </p>
            <Button asChild className="mt-4">
              <Link to="/mentorship/mentor/create">
                {t('mentorship.dashboard.createProfile', 'Create Mentor Profile')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status.toUpperCase() === 'PENDING');
  const acceptedRequests = requests.filter(r => r.status.toUpperCase() === 'ACCEPTED');
  const mentorActiveMentorships = mentorMentorships.filter(m => m.status === 'active');
  const mentorCompletedMentorships = mentorMentorships.filter(m => m.status === 'completed');

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">
                  {mentorName ? `Hi, ${mentorName.split(' ')[0]}` : t('mentorship.dashboard.title', 'Mentorship Dashboard')}
                </h1>
                <p className="text-muted-foreground">
                  {t('mentorship.dashboard.description', 'Manage your mentees, review progress, and update your availability.')}
                </p>
              </div>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('mentorship.dashboard.deleteProfile', 'Delete Profile')}
                  </Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>
                      {t('mentorship.dashboard.deleteConfirmTitle', 'Delete Mentor Profile?')}
                    </DialogTitle>
                    <DialogDescription>
                      {t('mentorship.dashboard.deleteConfirmMessage', 'Are you sure you want to delete your mentor profile? This action cannot be undone. You will need to create a new profile if you want to become a mentor again.')}
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                      disabled={isDeleting}
                    >
                      {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button
                      onClick={handleDeleteProfile}
                      disabled={isDeleting}
                      variant="destructive"
                    >
                      {isDeleting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                          {t('mentorship.dashboard.deleting', 'Deleting...')}
                        </>
                      ) : (
                        t('mentorship.dashboard.delete', 'Delete')
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Current Capacity Card */}
            {mentorProfileQuery.data && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('mentorship.dashboard.currentCapacity', 'Current Capacity')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {mentorProfileQuery.data.currentMentees}/{mentorProfileQuery.data.maxMentees} {t('mentorship.dashboard.filled', 'Filled')}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          mentorProfileQuery.data.currentMentees >= mentorProfileQuery.data.maxMentees
                            ? 'bg-amber-500'
                            : 'bg-primary'
                        }`}
                        style={{
                          width: `${Math.min((mentorProfileQuery.data.currentMentees / mentorProfileQuery.data.maxMentees) * 100, 100)}%`,
                        }}
                      />
                    </div>
                    {mentorProfileQuery.data.currentMentees < mentorProfileQuery.data.maxMentees && (
                      <p className="text-sm text-muted-foreground">
                        {mentorProfileQuery.data.maxMentees - mentorProfileQuery.data.currentMentees} {t('mentorship.dashboard.spotsRemaining', 'spots remaining for new mentees')}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('mentorship.dashboard.resumesReviewed', 'Resumes Reviewed')}
                      </p>
                      <p className="text-2xl font-bold">
                        {mentorActiveMentorships.length + mentorCompletedMentorships.length}
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('mentorship.dashboard.completedMentorships', 'Completed')}
                      </p>
                      <p className="text-2xl font-bold">
                        {mentorCompletedMentorships.length}
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t('mentorship.dashboard.avgRating', 'Avg. Rating')}
                      </p>
                      <p className="text-2xl font-bold">
                        {mentorProfileQuery.data?.averageRating?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Mentees Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle>{t('mentorship.dashboard.activeMentees', 'Active Mentees')}</CardTitle>
                    <Badge variant="secondary">{mentorActiveMentorships.length} {t('mentorship.dashboard.active', 'Active')}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingMentorMentorships ? (
                  <CenteredLoader />
                ) : mentorActiveMentorships.length > 0 ? (
                  <div className="space-y-4">
                    {mentorActiveMentorships.slice(0, 3).map((mentorship) => {
                      const correspondingRequest = acceptedRequests.find(
                        (r) => r.id === mentorship.id
                      );
                      return (
                        <div key={mentorship.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={mentorship.mentorAvatar} alt={mentorship.mentorName} />
                              <AvatarFallback>
                                {mentorship.mentorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {mentorship.mentorName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {correspondingRequest?.motivation || t('mentorship.dashboard.noGoal', 'No specific goal')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t('mentorship.dashboard.joined', 'Joined')} {new Date(mentorship.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {mentorship.resumeReviewId && (
                              <Button size="sm" asChild>
                                <Link to={`/mentorship/resume-review/${mentorship.resumeReviewId}`}>
                                  <MessageCircle className="h-4 w-4 mr-2" />
                                  {t('mentorship.dashboard.resumeReview', 'Resume Review')}
                                </Link>
                              </Button>
                            )}
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {t('mentorship.dashboard.noActiveMentees', 'No active mentees yet.')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Completed Mentorships Section */}
            {mentorCompletedMentorships.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{t('mentorship.dashboard.completedMentorships', 'Completed Mentorships')}</CardTitle>
                    <Badge variant="secondary">{mentorCompletedMentorships.length} {t('mentorship.dashboard.completed', 'Completed')}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentorCompletedMentorships.slice(0, 3).map((mentorship) => {
                      const correspondingRequest = acceptedRequests.find(
                        (r) => r.id === mentorship.id
                      );
                      return (
                        <div key={mentorship.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={mentorship.mentorAvatar} alt={mentorship.mentorName} />
                              <AvatarFallback>
                                {mentorship.mentorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold">
                                {mentorship.mentorName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {correspondingRequest?.motivation || t('mentorship.dashboard.noGoal', 'No specific goal')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t('mentorship.dashboard.completedOn', 'Completed')} {mentorship.completedAt ? new Date(mentorship.completedAt).toLocaleDateString() : new Date(mentorship.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {mentorship.resumeReviewId && (
                              <Button size="sm" variant="outline" asChild>
                                <Link to={`/mentorship/resume-review/${mentorship.resumeReviewId}`}>
                                  <FileText className="h-4 w-4 mr-2" />
                                  {t('mentorship.dashboard.viewReview', 'View Review')}
                                </Link>
                              </Button>
                            )}
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pending Requests */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('mentorship.dashboard.pendingRequests', 'Pending Requests')}</CardTitle>
                  {pendingRequests.length > 0 && (
                    <Badge variant="destructive">{pendingRequests.length}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {pendingRequests.length > 0 ? (
                  <div className="space-y-4">
                    {pendingRequests.slice(0, 2).map((request) => {
                      const requesterProfile = menteeProfiles[request.requesterId];
                      const isCapacityFull = mentorProfileQuery.data && mentorProfileQuery.data.currentMentees >= mentorProfileQuery.data.maxMentees;
                      return (
                        <div key={request.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={requesterProfile?.imageUrl} alt={requesterProfile?.firstName} />
                              <AvatarFallback>
                                {requesterProfile ? `${requesterProfile.firstName?.[0] || ''}${requesterProfile.lastName?.[0] || ''}`.toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold text-sm">
                                {requesterProfile ? `${requesterProfile.firstName} ${requesterProfile.lastName}` : 'Unknown User'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {request.motivation?.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => handleRespond(request.id, true)}
                              disabled={respondingTo === request.id || respondMutation.isPending || isCapacityFull}
                              title={isCapacityFull ? t('mentorship.dashboard.capacityFullTooltip', 'Capacity is full') : ''}
                            >
                              {t('mentorship.dashboard.approve', 'Approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                              onClick={() => handleRespond(request.id, false)}
                              disabled={respondingTo === request.id || respondMutation.isPending}
                            >
                              {t('mentorship.dashboard.decline', 'Decline')}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {pendingRequests.length > 2 && (
                      <Button variant="ghost" size="sm" className="w-full" asChild>
                        <Link to="/mentorship/mentor/requests">
                          {t('mentorship.dashboard.viewAll', 'View All')} ({pendingRequests.length})
                        </Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {t('mentorship.dashboard.noPendingRequests', 'No pending requests')}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboardPage;

