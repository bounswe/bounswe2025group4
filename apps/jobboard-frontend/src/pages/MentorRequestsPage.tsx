import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, CheckCircle, XCircle, User, Calendar } from 'lucide-react';
import type { MentorshipRequestDTO } from '@/types/api.types';
import { useAuth } from '@/contexts/AuthContext';
import { getMentorMentorshipRequests, respondToMentorshipRequest } from '@/services/mentorship.service';
import { profileService } from '@/services/profile.service';
import type { PublicProfile } from '@/types/profile.types';
import CenteredLoader from '@/components/CenteredLoader';
import CenteredError from '@/components/CenteredError';
import { toast } from 'react-toastify';

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    case 'ACCEPTED':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'REJECTED':
    case 'DECLINED':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'ACCEPTED':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'REJECTED':
    case 'DECLINED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const MentorRequestsPage = () => {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [requests, setRequests] = useState<MentorshipRequestDTO[]>([]);
  const [menteeProfiles, setMenteeProfiles] = useState<Record<string, PublicProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('pending');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const mentorRequests = await getMentorMentorshipRequests(user.id);
        console.log('Fetched mentor requests:', mentorRequests);
        setRequests(mentorRequests);

        // Fetch profile information for each mentee
        const uniqueRequesterIds = [...new Set(mentorRequests.map(r => r.requesterId))];
        const profiles: Record<string, PublicProfile> = {};
        
        await Promise.all(
          uniqueRequesterIds.map(async (requesterId) => {
            try {
              const requesterIdNum = parseInt(requesterId, 10);
              if (!isNaN(requesterIdNum)) {
                const profile = await profileService.getPublicProfile(requesterIdNum);
                profiles[requesterId] = profile;
              }
            } catch (err) {
              console.error(`Error fetching profile for requester ${requesterId}:`, err);
              // Continue even if one profile fails
            }
          })
        );
        
        setMenteeProfiles(profiles);
      } catch (err) {
        console.error('Error fetching mentor requests:', err);
        setError('Failed to load mentorship requests. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user?.id]);

  const handleRespond = async (requestId: string, accept: boolean) => {
    if (!user?.id) {
      toast.error('You must be logged in to respond to requests');
      return;
    }

    setRespondingTo(requestId);

    try {
      const requestIdNum = parseInt(requestId, 10);
      if (isNaN(requestIdNum)) {
        throw new Error('Invalid request ID');
      }

      await respondToMentorshipRequest(requestIdNum, { accept });
      
      const updatedRequests = await getMentorMentorshipRequests(user.id);
      setRequests(updatedRequests);
      
      // Switch to appropriate tab after responding
      if (accept) {
        setActiveTab('accepted');
      } else {
        setActiveTab('rejected');
      }

      // Refresh mentee profiles for any new requesters
      const uniqueRequesterIds = [...new Set(updatedRequests.map(r => r.requesterId))];
      const newProfiles: Record<string, PublicProfile> = { ...menteeProfiles };
      
      await Promise.all(
        uniqueRequesterIds.map(async (requesterId) => {
          if (!newProfiles[requesterId]) {
            try {
              const requesterIdNum = parseInt(requesterId, 10);
              if (!isNaN(requesterIdNum)) {
                const profile = await profileService.getPublicProfile(requesterIdNum);
                newProfiles[requesterId] = profile;
              }
            } catch (err) {
              console.error(`Error fetching profile for requester ${requesterId}:`, err);
            }
          }
        })
      );
      
      setMenteeProfiles(newProfiles);

      toast.success(
        accept
          ? t('mentorship.mentorRequests.acceptSuccess') || 'Request accepted successfully!'
          : t('mentorship.mentorRequests.rejectSuccess') || 'Request rejected.'
      );
    } catch (err: any) {
      console.error('Error responding to request:', err);
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to respond to request.';
      toast.error(errorMessage);
    } finally {
      setRespondingTo(null);
    }
  };

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return <CenteredError message={error} />;
  }

  const pendingRequests = requests.filter(r => {
    const status = r.status.toUpperCase();
    return status === 'PENDING';
  });
  const acceptedRequests = requests.filter(r => {
    const status = r.status.toUpperCase();
    return status === 'ACCEPTED';
  });
  const rejectedRequests = requests.filter(r => {
    const status = r.status.toUpperCase();
    return status === 'REJECTED' || status === 'DECLINED';
  });

  const RequestCard = ({ request }: { request: MentorshipRequestDTO }) => {
    const isPending = request.status.toUpperCase() === 'PENDING';
    const isResponding = respondingTo === request.id;
    const menteeProfile = menteeProfiles[request.requesterId];

    return (
      <Card className={`border-l-4 ${isPending ? 'border-l-amber-500' : request.status.toUpperCase() === 'ACCEPTED' ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Link 
              to={`/profile/${request.requesterId}`}
              className="relative hover:opacity-80 transition-opacity"
            >
              <Avatar className="w-12 h-12 ring-2 ring-amber-100 dark:ring-amber-900 cursor-pointer">
                <AvatarImage 
                  src={menteeProfiles[request.requesterId]?.imageUrl} 
                  alt={menteeProfiles[request.requesterId] 
                    ? `${menteeProfiles[request.requesterId].firstName} ${menteeProfiles[request.requesterId].lastName}`
                    : `Mentee ${request.requesterId}`}
                />
                <AvatarFallback>
                  {menteeProfiles[request.requesterId] 
                    ? `${(menteeProfiles[request.requesterId].firstName?.[0] || '').toUpperCase()}${(menteeProfiles[request.requesterId].lastName?.[0] || '').toUpperCase()}`
                    : <User className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full">
                <User className="h-3 w-3 text-white" />
              </div>
            </Link>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold">
                  {menteeProfiles[request.requesterId] 
                    ? `${menteeProfiles[request.requesterId].firstName} ${menteeProfiles[request.requesterId].lastName}`
                    : `${t('mentorship.mentorRequests.mentee')} #${request.requesterId}`}
                </h3>
                <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="ml-1 capitalize">{request.status.toLowerCase()}</span>
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Wants mentorship from you
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {t('mentorship.mentorRequests.requested')}: {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Profile Info */}
          {menteeProfile && (
            <div className="mb-4 space-y-2">
              {menteeProfile.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2">{menteeProfile.bio}</p>
              )}
            </div>
          )}

          {isPending && (
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                onClick={() => handleRespond(request.id, true)}
                disabled={isResponding}
                className="flex-1"
              >
                {isResponding ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('mentorship.mentorRequests.processing')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {t('mentorship.mentorRequests.accept')}
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRespond(request.id, false)}
                disabled={isResponding}
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('mentorship.mentorRequests.reject')}
              </Button>
            </div>
          )}

          {!isPending && (
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                {request.status.toUpperCase() === 'ACCEPTED'
                  ? t('mentorship.mentorRequests.acceptedMessage')
                  : (request.status.toUpperCase() === 'REJECTED' || request.status.toUpperCase() === 'DECLINED')
                  ? t('mentorship.mentorRequests.rejectedMessage')
                  : `Status: ${request.status}`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t('mentorship.mentorRequests.title')}</h1>
        <p className="text-muted-foreground">
          {t('mentorship.mentorRequests.subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            {t('mentorship.mentorRequests.pending')} ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            {t('mentorship.mentorRequests.accepted')} ({acceptedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {t('mentorship.mentorRequests.rejected')} ({rejectedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.mentorRequests.noPending')}</h3>
                <p className="text-muted-foreground">
                  {t('mentorship.mentorRequests.noPendingDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-4">
          {acceptedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {acceptedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.mentorRequests.noAccepted')}</h3>
                <p className="text-muted-foreground">
                  {t('mentorship.mentorRequests.noAcceptedDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {rejectedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{t('mentorship.mentorRequests.noRejected')}</h3>
                <p className="text-muted-foreground">
                  {t('mentorship.mentorRequests.noRejectedDesc')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MentorRequestsPage;

