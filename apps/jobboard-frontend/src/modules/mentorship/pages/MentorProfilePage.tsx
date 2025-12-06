import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { Star, MapPin, Award, GraduationCap, Briefcase, Edit, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { Separator } from '@shared/components/ui/separator';
import type { Mentor, MentorshipReview } from '@shared/types/mentor';
import { getMentorProfile, getMentorMentorshipRequests, getMenteeMentorships, createMentorshipRequest, completeMentorship } from '@modules/mentorship/services/mentorship.service';
import type { MentorshipDetailsDTO } from '@shared/types/api.types';
import { convertMentorProfileToMentor, convertMentorReviewToMentorshipReview } from '@shared/utils/mentorship.utils';
import { profileService } from '@modules/profile/services/profile.service';
import type { PublicProfile } from '@shared/types/profile.types';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';
import type { MentorshipRequestDTO } from '@shared/types/api.types';
import { toast } from 'react-toastify';

const MentorProfilePage = () => {
  const { t } = useTranslation('common');
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviews, setReviews] = useState<MentorshipReview[]>([]);
  const [requests, setRequests] = useState<MentorshipRequestDTO[]>([]);
  const [menteeProfiles, setMenteeProfiles] = useState<Record<string, PublicProfile>>({});
  const [mentorNormalProfile, setMentorNormalProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveMentorship, setHasActiveMentorship] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [completingRequestId, setCompletingRequestId] = useState<string | null>(null);
  const [activeMentorships, setActiveMentorships] = useState<MentorshipDetailsDTO[]>([]);
  const [completedMentorships, setCompletedMentorships] = useState<MentorshipDetailsDTO[]>([]);
  
  const isOwnProfile = user?.id && id && parseInt(id, 10) === user.id;

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
      
      let mentorProfileImage: string | undefined;
      let mentorNormalProfileForConversion: PublicProfile | null = null;
      try {
        const mentorProfile = await profileService.getPublicProfile(mentorId);
        mentorProfileImage = mentorProfile.imageUrl;
        mentorNormalProfileForConversion = mentorProfile;
        setMentorNormalProfile(mentorProfile);
      } catch (err) {
        console.error('Error fetching mentor profile:', err);
      }
      
      const convertedMentor = convertMentorProfileToMentor(
        backendMentor, 
        mentorProfileImage,
        mentorNormalProfileForConversion ? {
          bio: mentorNormalProfileForConversion.bio,
          experiences: mentorNormalProfileForConversion.experiences,
          educations: mentorNormalProfileForConversion.educations,
        } : undefined
      );
      setMentor(convertedMentor);
      
      const convertedReviews = backendMentor.reviews 
        ? backendMentor.reviews.map(review => convertMentorReviewToMentorshipReview(review))
        : [];
      setReviews(convertedReviews);

      if (isOwnProfile && user?.id) {
        try {
          const mentorRequests = await getMentorMentorshipRequests(user.id);
          setRequests(mentorRequests);

          const uniqueRequesterIds = [...new Set(mentorRequests.map(r => r.requesterId))];
          const profiles: Record<string, PublicProfile> = {};
          const mentorIdNum = parseInt(id || '0', 10);
          const activeMentorshipsList: MentorshipDetailsDTO[] = [];
          const completedMentorshipsList: MentorshipDetailsDTO[] = [];
          
          await Promise.all(
            uniqueRequesterIds.map(async (requesterId) => {
              try {
                const requesterIdStr = String(requesterId);
                const requesterIdNum = typeof requesterId === 'string' 
                  ? parseInt(requesterId, 10) 
                  : requesterId;
                
                if (!isNaN(requesterIdNum) && requesterIdNum > 0) {
                  const profile = await profileService.getPublicProfile(requesterIdNum);
                  profiles[requesterIdStr] = profile;
                  profiles[requesterIdNum] = profile;
                  profiles[requesterIdNum.toString()] = profile;
                  profiles[String(requesterIdNum)] = profile;
                  if (typeof requesterId === 'string') {
                    profiles[requesterId] = profile;
                  }
                  
                  try {
                    const menteeMentorships = await getMenteeMentorships(requesterIdNum);
                    const mentorshipWithThisMentor = menteeMentorships.find(
                      m => m.mentorId === mentorIdNum
                    );
                    
                    if (mentorshipWithThisMentor) {
                      if (mentorshipWithThisMentor.reviewStatus?.toUpperCase() === 'COMPLETED' || 
                          mentorshipWithThisMentor.requestStatus?.toUpperCase() === 'COMPLETED') {
                        completedMentorshipsList.push(mentorshipWithThisMentor);
                      } else if (mentorshipWithThisMentor.requestStatus?.toUpperCase() === 'ACCEPTED' || 
                                 mentorshipWithThisMentor.reviewStatus?.toUpperCase() === 'ACTIVE') {
                        activeMentorshipsList.push(mentorshipWithThisMentor);
                      }
                    }
                  } catch (err) {
                    // Mentee might not have mentorships, that's okay
                    console.warn(`Could not fetch mentorships for mentee ${requesterIdNum}:`, err);
                  }
                }
              } catch (err) {
                console.error(`Error fetching profile for requester ${requesterId}:`, err);
              }
            })
          );
          
          setMenteeProfiles(profiles);
          setActiveMentorships(activeMentorshipsList);
          setCompletedMentorships(completedMentorshipsList);
        } catch (err) {
          console.error('Error fetching mentor requests:', err);
        }
      }

      if (!isOwnProfile && user?.id) {
        try {
          const mentorships = await getMenteeMentorships(user.id);
          const mentorIdNum = parseInt(id || '0', 10);
          
          const existingRequest = mentorships.find(
            (m: MentorshipDetailsDTO) => 
              m.mentorId === mentorIdNum && 
              (m.requestStatus?.toUpperCase() === 'PENDING' || 
               m.requestStatus?.toUpperCase() === 'ACCEPTED' || 
               m.reviewStatus?.toUpperCase() === 'ACTIVE')
          );
          
          setHasActiveMentorship(!!existingRequest);
        } catch (err) {
          console.error('Error checking active mentorship:', err);
        }
      }
    } catch (err: any) {
      console.error('Error fetching mentor profile:', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load mentor profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorProfile();
  }, [id, user?.id, isOwnProfile]);

  useEffect(() => {
    const handleRefresh = () => {
      if (id) {
        fetchMentorProfile();
      }
    };
    window.addEventListener('mentorProfileRefresh', handleRefresh);
    return () => window.removeEventListener('mentorProfileRefresh', handleRefresh);
  }, [id]);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error || !mentor) {
    return <CenteredError message={error || 'Mentor not found'} />;
  }

  const isAvailable = mentor.mentees < mentor.capacity;

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar className="w-32 h-32">
            <AvatarImage src={mentor.profileImage} alt={mentor.name} />
            <AvatarFallback className="text-2xl">
              {mentor.name.split(' ').map(n => n[0]?.toUpperCase() || '').join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{mentor.name}</h1>
            {mentor.title && (
              <p className="text-xl text-muted-foreground mb-4">{mentor.title}</p>
            )}
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(mentor.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                  />
                ))}
                <span className="ml-2 font-semibold">{mentor.rating.toFixed(1)}</span>
                <span className="ml-1 text-muted-foreground">({mentor.reviews} {t('mentorship.profile.reviews')})</span>
              </div>
              
              <div className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{t('mentorship.profile.remote')}</span>
              </div>
            </div>


            {isOwnProfile ? (
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-auto"
                onClick={() => navigate(`/mentorship/mentor/edit?userId=${user.id}`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('mentorship.profile.editProfile') || 'Edit Profile'}
              </Button>
            ) : hasActiveMentorship ? (
              <Button
                size="lg"
                variant="outline"
                className="w-full md:w-auto"
                asChild
              >
                <Link to="/mentorship/my">
                  {t('mentorship.profile.viewMentorship') || 'View My Mentorship'}
                </Link>
              </Button>
            ) : (
              <Button 
                size="lg" 
                disabled={!isAvailable || isRequesting || hasActiveMentorship}
                className="w-full md:w-auto"
                onClick={async () => {
                  if (!id || !user?.id) return;
                  
                  try {
                    const mentorships = await getMenteeMentorships(user.id);
                    const mentorIdNum = parseInt(id, 10);
                    const existingRequest = mentorships.find(
                      (m: MentorshipDetailsDTO) => 
                        m.mentorId === mentorIdNum && 
                        (m.requestStatus?.toUpperCase() === 'PENDING' || 
                         m.requestStatus?.toUpperCase() === 'ACCEPTED' || 
                         m.reviewStatus?.toUpperCase() === 'ACTIVE')
                    );
                    
                    if (existingRequest) {
                      toast.error(t('mentorship.profile.alreadyRequested') || 'You already have a pending or active mentorship request with this mentor.');
                      setHasActiveMentorship(true);
                      return;
                    }
                  } catch (err) {
                    console.error('Error checking existing requests:', err);
                  }
                  
                  setIsRequesting(true);
                  try {
                    await createMentorshipRequest({ mentorId: parseInt(id, 10) });
                    toast.success(t('mentorship.profile.requestSent') || 'Mentorship request sent successfully!');
                    setHasActiveMentorship(true); // Disable button after successful request
                    navigate('/mentorship/my', {
                      state: { 
                        showSuccess: true, 
                        mentorName: mentor.name,
                        activeTab: 'pending' // Switch to pending tab
                      }
                    });
                  } catch (err: any) {
                    console.error('Error sending mentorship request:', err);
                    const errorMessage = err?.response?.data?.message || err?.message || t('mentorship.profile.requestError') || 'Failed to send mentorship request';
                    toast.error(errorMessage);
                  } finally {
                    setIsRequesting(false);
                  }
                }}
              >
                {isRequesting 
                  ? (t('mentorship.profile.requesting') || 'Sending...')
                  : (hasActiveMentorship 
                      ? (t('mentorship.profile.alreadyRequested') || 'Already Requested')
                      : (isAvailable ? t('mentorship.profile.requestMentorship') : t('mentorship.profile.unavailable'))
                    )
                }
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          {mentor.bio && (
            <Card>
              <CardHeader>
                <CardTitle>{t('mentorship.profile.about')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{mentor.bio}</p>
              </CardContent>
            </Card>
          )}

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Briefcase className="h-5 w-5 mr-2" />
                  {t('mentorship.profile.experience')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mentorNormalProfile?.experiences && mentorNormalProfile.experiences.length > 0 ? (
                  <>
                    <div className="space-y-4">
                      {mentorNormalProfile.experiences.map((exp) => (
                        <div key={exp.id} className="border-b last:border-0 pb-3 last:pb-0">
                          <div className="font-semibold">{exp.position}</div>
                          <div className="text-sm text-muted-foreground">{exp.company}</div>
                          {exp.description && (
                            <div className="text-sm mt-2 text-muted-foreground">{exp.description}</div>
                          )}
                          <div className="text-xs text-muted-foreground mt-2">
                            {new Date(exp.startDate).toLocaleDateString()} - {exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'Present'}
                          </div>
                        </div>
                      ))}
                    </div>
                    {mentor.achievements && mentor.achievements.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">{t('mentorship.profile.keyAchievements')}:</h4>
                        <ul className="space-y-1">
                          {mentor.achievements.map((achievement, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start">
                              <Award className="h-4 w-4 mr-2 mt-0.5 text-yellow-500" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground">{mentor.experience || 'No experience information available.'}</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="h-5 w-5 mr-2" />
                  {t('mentorship.profile.education')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mentorNormalProfile?.educations && mentorNormalProfile.educations.length > 0 ? (
                  <div className="space-y-4">
                    {mentorNormalProfile.educations.map((edu) => (
                      <div key={edu.id} className="border-b last:border-0 pb-3 last:pb-0">
                        <div className="font-semibold">{edu.degree}</div>
                        <div className="text-sm text-muted-foreground">{edu.school}</div>
                        {edu.field && (
                          <div className="text-sm mt-1 text-muted-foreground">{edu.field}</div>
                        )}
                        {edu.description && (
                          <div className="text-sm mt-2 text-muted-foreground">{edu.description}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(edu.startDate).toLocaleDateString()} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">{mentor.education || 'No education information available.'}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Expertise and Languages - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expertise (from backend) */}
            {mentor.tags && mentor.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Expertise</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {mentor.languages && mentor.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('mentorship.profile.languages')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {mentor.languages.map((language) => (
                      <Badge key={language} variant="outline">
                        {language}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('mentorship.profile.reviewsTitle', { count: reviews.length })}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.menteeAvatar} alt={review.menteeName} />
                          <AvatarFallback>
                            {review.menteeName.split(' ').map(n => n[0]?.toUpperCase() || '').join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{review.menteeName}</h4>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {review.mentorshipDuration}
                            </span>
                          </div>
                          <p className="text-muted-foreground mb-2">{review.comment}</p>
                          <p className="text-sm text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      {review.id !== reviews[reviews.length - 1].id && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Mentorship Stats */}
          <Card>
            <CardHeader>
              <CardTitle>{t('mentorship.profile.mentorshipStats')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('mentorship.profile.currentMentees')}:</span>
                <span className="font-semibold">{mentor.mentees}/{mentor.capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('mentorship.profile.totalReviews')}:</span>
                <span className="font-semibold">{mentor.reviews}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('mentorship.profile.averageRating')}:</span>
                <span className="font-semibold">{mentor.rating.toFixed(1)}/5</span>
              </div>
              {isOwnProfile && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('mentorship.profile.completedMentorships') || 'Completed Mentorships'}:</span>
                  <span className="font-semibold">{completedMentorships.length}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mentorship Requests - Only show for own profile */}
          {isOwnProfile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('mentorship.profile.mentorshipRequests') || 'Mentorship Requests'}</span>
                  {requests.filter(r => r.status.toUpperCase() === 'PENDING').length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {requests.filter(r => r.status.toUpperCase() === 'PENDING').length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {requests.filter(r => r.status.toUpperCase() === 'PENDING').length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {requests
                        .filter(r => r.status.toUpperCase() === 'PENDING')
                        .slice(0, 2)
                        .map((request) => {
                          const requesterIdStr = String(request.requesterId);
                          const requesterIdNum = typeof request.requesterId === 'string' 
                            ? parseInt(request.requesterId, 10) 
                            : request.requesterId;
                          
                          const menteeProfile = menteeProfiles[request.requesterId] || 
                                               menteeProfiles[requesterIdStr] || 
                                               menteeProfiles[requesterIdNum] || 
                                               menteeProfiles[requesterIdNum?.toString()] || 
                                               menteeProfiles[String(requesterIdNum)];
                          
                          return (
                            <div key={request.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/50">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={menteeProfile?.imageUrl} alt={menteeProfile ? `${menteeProfile.firstName} ${menteeProfile.lastName}` : ''} />
                                <AvatarFallback className="text-xs">
                                  {menteeProfile 
                                    ? `${(menteeProfile.firstName?.[0] || '').toUpperCase()}${(menteeProfile.lastName?.[0] || '').toUpperCase()}`
                                    : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {menteeProfile 
                                    ? `${menteeProfile.firstName} ${menteeProfile.lastName}`
                                    : `Mentee #${request.requesterId}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(request.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                    {requests.filter(r => r.status.toUpperCase() === 'PENDING').length > 2 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{requests.filter(r => r.status.toUpperCase() === 'PENDING').length - 2} more
                      </p>
                    )}
                    <Button 
                      variant="default" 
                      className="w-full"
                      asChild
                    >
                      <Link to="/mentor/requests">
                        {t('mentorship.profile.viewAllRequests') || 'View All Requests'}
                      </Link>
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      {t('mentorship.profile.noPendingRequests') || 'No pending requests'}
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      asChild
                    >
                      <Link to="/mentor/requests">
                        {t('mentorship.profile.viewAllRequests') || 'View All Requests'}
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Active Mentees - Only show for own profile */}
          {isOwnProfile && requests.filter(r => r.status.toUpperCase() === 'ACCEPTED').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('mentorship.profile.activeMentees') || 'Active Mentees'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Array.from(
                    new Map(
                      requests
                        .filter(r => r.status.toUpperCase() === 'ACCEPTED')
                        .map(r => [String(r.requesterId), r])
                    ).values()
                  )
                    .slice(0, 5)
                    .map((request) => {
                      const requesterIdOriginal = request.requesterId;
                      const requesterIdStr = String(requesterIdOriginal);
                      const requesterIdNum = typeof requesterIdOriginal === 'string' 
                        ? parseInt(requesterIdOriginal, 10) 
                        : requesterIdOriginal;
                      
                      const menteeProfile = menteeProfiles[requesterIdOriginal] || 
                                           menteeProfiles[requesterIdStr] || 
                                           menteeProfiles[requesterIdNum] || 
                                           menteeProfiles[requesterIdNum?.toString()] || 
                                           menteeProfiles[String(requesterIdNum)];
                      
                      // Find the corresponding active mentorship to get resumeReviewId
                      const mentorIdNum = parseInt(id || '0', 10);
                      const activeMentorship = activeMentorships.find(
                        m => m.mentorId === mentorIdNum && 
                        String(m.mentorshipRequestId) === String(request.id)
                      );
                      
                      return (
                        <div key={request.id} className="p-3 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={menteeProfile?.imageUrl} alt={menteeProfile ? `${menteeProfile.firstName} ${menteeProfile.lastName}` : ''} />
                                <AvatarFallback>
                                  {menteeProfile 
                                    ? `${(menteeProfile.firstName?.[0] || '').toUpperCase()}${(menteeProfile.lastName?.[0] || '').toUpperCase()}`
                                    : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium flex-1">
                                {menteeProfile 
                                  ? `${menteeProfile.firstName} ${menteeProfile.lastName}`
                                  : `Mentee #${request.requesterId}`}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex gap-2">
                              {activeMentorship?.conversationId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="flex-1"
                                >
                                  <Link to={`/chat?mentorshipId=${activeMentorship.mentorshipRequestId}`}>
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    {t('mentorship.myMentorships.openChat') || 'Open Chat'}
                                  </Link>
                                </Button>
                              )}
                              
                              {menteeProfile && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="flex-1"
                                >
                                  <Link to={`/profile/${requesterIdNum}`}>
                                    {t('mentorship.profile.viewProfile') || 'View Profile'}
                                  </Link>
                                </Button>
                              )}
                            </div>
                            
                            {activeMentorship?.resumeReviewId && (
                              <div className="flex gap-2 w-full">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  className="flex-1"
                                >
                                  <Link to={`/resume-review/${activeMentorship.resumeReviewId}`}>
                                    {t('mentorship.profile.reviewResume') || 'Review Resume'}
                                  </Link>
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={completingRequestId === request.id}
                                  onClick={async () => {
                                    if (!activeMentorship.resumeReviewId) return;
                                    
                                    setCompletingRequestId(request.id);
                                    try {
                                      await completeMentorship(activeMentorship.resumeReviewId);
                                      toast.success(t('mentorship.myMentorships.completeSuccess') || 'Mentorship completed successfully!');
                                      // Refresh data
                                      fetchMentorProfile();
                                    } catch (err: any) {
                                      console.error('Error completing mentorship:', err);
                                      const errorMessage = err?.response?.data?.message || err?.message || t('mentorship.myMentorships.completeError') || 'Failed to complete mentorship';
                                      toast.error(errorMessage);
                                    } finally {
                                      setCompletingRequestId(null);
                                    }
                                  }}
                                  className="flex-1"
                                >
                                  {completingRequestId === request.id 
                                    ? (t('mentorship.myMentorships.completing') || 'Completing...')
                                    : (t('mentorship.myMentorships.complete') || 'Complete Mentorship')
                                  }
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completed Mentorships - Only show for own profile */}
          {isOwnProfile && completedMentorships.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>{t('mentorship.profile.completedMentorships') || 'Completed Mentorships'} ({completedMentorships.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Array.from(
                    new Map(
                      completedMentorships
                        .map(m => {
                          // Use mentorshipRequestId as unique key
                          const request = requests.find(r => String(r.id) === String(m.mentorshipRequestId));
                          if (!request) return null;
                          return [String(request.requesterId), { mentorship: m, request }];
                        })
                        .filter(Boolean) as Array<[string, { mentorship: MentorshipDetailsDTO; request: MentorshipRequestDTO }]>
                    ).values()
                  )
                    .slice(0, 5)
                    .map(({ mentorship, request }) => {
                      const requesterIdOriginal = request.requesterId;
                      const requesterIdStr = String(requesterIdOriginal);
                      const requesterIdNum = typeof requesterIdOriginal === 'string' 
                        ? parseInt(requesterIdOriginal, 10) 
                        : requesterIdOriginal;
                      
                      const menteeProfile = menteeProfiles[requesterIdOriginal] || 
                                           menteeProfiles[requesterIdStr] || 
                                           menteeProfiles[requesterIdNum] || 
                                           menteeProfiles[requesterIdNum?.toString()] || 
                                           menteeProfiles[String(requesterIdNum)];
                      
                      return (
                        <div key={mentorship.mentorshipRequestId} className="p-3 border rounded-lg space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-1">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={menteeProfile?.imageUrl} alt={menteeProfile ? `${menteeProfile.firstName} ${menteeProfile.lastName}` : ''} />
                                <AvatarFallback>
                                  {menteeProfile 
                                    ? `${(menteeProfile.firstName?.[0] || '').toUpperCase()}${(menteeProfile.lastName?.[0] || '').toUpperCase()}`
                                    : 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium flex-1">
                                {menteeProfile 
                                  ? `${menteeProfile.firstName} ${menteeProfile.lastName}`
                                  : `Mentee #${request.requesterId}`}
                              </span>
                            </div>
                          </div>
                          
                          {menteeProfile && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="w-full"
                            >
                              <Link to={`/profile/${requesterIdNum}`}>
                                {t('mentorship.profile.viewProfile') || 'View Profile'}
                              </Link>
                            </Button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorProfilePage;
