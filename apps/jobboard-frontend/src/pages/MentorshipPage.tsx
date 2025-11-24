import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertCircle, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import MentorCard from "@/components/mentorship/MentorCard";
import { type Mentor } from "@/types/mentor";
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { getMentors, getMentorProfile } from '@/services/mentorship.service';
import { getMenteeMentorships } from '@/services/mentorship.service';
import { convertMentorProfileToMentor } from '@/utils/mentorship.utils';
import { profileService } from '@/services/profile.service';
import CenteredLoader from '@/components/CenteredLoader';
import CenteredError from '@/components/CenteredError';

const MentorshipPage = () => {
  const { t } = useTranslation('common');
  const { isAuthenticated, user } = useAuth();
  const [searchInput, setSearchInput] = useState('');
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMentorProfile, setHasMentorProfile] = useState(false);
  const [requestedMentorIds, setRequestedMentorIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const checkMentorProfile = async () => {
      if (!isAuthenticated || !user?.id) {
        setHasMentorProfile(false);
        return;
      }

      try {
        const profile = await getMentorProfile(user.id);
        setHasMentorProfile(!!profile);
      } catch (err: any) {
        // Other errors - assume no profile, only log if it's not a network error
        if (err?.code !== 'ERR_NETWORK') {
          console.error('Error checking mentor profile:', err);
        }
        setHasMentorProfile(false);
      }

      try {
        const mentorships = await getMenteeMentorships(user.id);
        const mentorIds = new Set(
          mentorships
            .filter(m => 
              m.requestStatus === 'PENDING' || 
              m.requestStatus === 'ACCEPTED' ||
              m.reviewStatus === 'ACTIVE' // Active mentorship means you already have an active relationship
            )
            .map(m => m.mentorId)
        );
        setRequestedMentorIds(mentorIds);
      } catch (err) {
        console.error('Error fetching existing mentorships:', err);
        // Don't block the page if this fails
      }
    };

    checkMentorProfile();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const backendMentors = await getMentors();
        
        // Fetch mentor profiles to get avatars and normal profile data
        const mentorProfilesMap: Record<string, { imageUrl?: string; profile?: any }> = {};
        await Promise.all(
          backendMentors.map(async (mentor) => {
            try {
              const mentorId = parseInt(mentor.id, 10);
              if (!isNaN(mentorId)) {
                const profile = await profileService.getPublicProfile(mentorId);
                mentorProfilesMap[mentor.id] = {
                  imageUrl: profile.imageUrl,
                  profile: {
                    bio: profile.bio,
                    experiences: profile.experiences,
                    educations: profile.educations,
                  }
                };
              }
            } catch (err: any) {
              // Profile might not exist (404) or other errors - that's okay, don't log 404s
              if (err?.response?.status !== 404 && err?.code !== 'ERR_NETWORK') {
                console.warn(`Could not fetch profile for mentor ${mentor.id}:`, err);
              }
              mentorProfilesMap[mentor.id] = {};
            }
          })
        );
        
        const convertedMentors = backendMentors.map(mentor => 
          convertMentorProfileToMentor(
            mentor, 
            mentorProfilesMap[mentor.id]?.imageUrl,
            mentorProfilesMap[mentor.id]?.profile
          )
        );
        
        const filteredMentors = user?.id
          ? convertedMentors.filter(mentor => mentor.id !== user.id.toString())
          : convertedMentors;
        
        setMentors(filteredMentors);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        // Check if it's a timeout or connection error
        if (err && typeof err === 'object' && 'code' in err) {
          const axiosError = err as { code?: string; message?: string };
          if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
            setError(t('mentorship.errors.timeout') || 'Connection timeout. Please check if the backend server is running.');
          } else if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('Network Error')) {
            setError(t('mentorship.errors.networkError') || 'Cannot connect to server. Please check if the backend is running.');
          } else {
            setError(t('mentorship.errors.loadFailed') || 'Failed to load mentors. Please try again later.');
          }
        } else {
          setError(t('mentorship.errors.loadFailed') || 'Failed to load mentors. Please try again later.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMentors();
  }, [user?.id]);
  
  const filteredMentors = useMemo(() => {
    if (!searchInput.trim()) {
      return mentors;
    }
    const searchLower = searchInput.toLowerCase();
    return mentors.filter(mentor =>
      mentor.name.toLowerCase().includes(searchLower) ||
      mentor.title.toLowerCase().includes(searchLower) ||
      mentor.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
      mentor.specialties.some(spec => spec.toLowerCase().includes(searchLower))
    );
  }, [searchInput, mentors]);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return <CenteredError message={error} />;
  }
  
  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">
              {t('mentorship.title')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {t('mentorship.subtitle') || 'Find experienced mentors to guide your career'}
            </p>
          </div>
          {isAuthenticated && (
            <>
              {hasMentorProfile ? (
                <Button asChild variant="outline">
                  <Link to={`/mentorship/${user?.id}`}>
                    {t('mentorship.viewMyProfile') || 'View My Profile'}
                  </Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link to="/mentorship/mentor/create">
                    {t('mentorship.becomeMentor')}
                  </Link>
                </Button>
              )}
            </>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t('mentorship.searchPlaceholder') || 'Search mentors by name, expertise, or skills...'}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Auth Required Banner (if not authenticated) */}
      {!isAuthenticated && (
        <Card className="gap-4 py-4 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 mb-6">
          <CardContent className="px-4 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100">
                  {t('mentorship.authRequired.title')}
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  {t('mentorship.authRequired.description')}
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  {t('mentorship.authRequired.invitation')}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600">
                <Link to="/register">{t('mentorship.authRequired.signUp')}</Link>
              </Button>
              <Button asChild variant="outline" className="border-amber-300 dark:border-amber-700">
                <Link to="/login">{t('mentorship.authRequired.login')}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Mentor Grid (blurred if not authenticated) */}
      {filteredMentors.length > 0 ? (
        <div className={cn(
          "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
          !isAuthenticated && "opacity-60 pointer-events-none blur-sm select-none"
        )}>
          {filteredMentors.map((mentor) => {
            const mentorIdNum = parseInt(mentor.id, 10);
            const hasRequested = !isNaN(mentorIdNum) && requestedMentorIds.has(mentorIdNum);
            return (
              <MentorCard 
                key={mentor.id} 
                mentor={mentor} 
                hasRequested={hasRequested}
              />
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">
              {t('mentorship.noResults') || 'No mentors found. Try adjusting your search.'}
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Login Prompt Overlay (if not authenticated) */}
      {!isAuthenticated && (
        <div className="text-center mt-6">
          <p className="text-muted-foreground mb-4">
            {t('mentorship.authRequired.viewMore')}
          </p>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
