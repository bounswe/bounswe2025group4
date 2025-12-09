import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Search, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@shared/components/ui/button';
import { Card, CardContent } from '@shared/components/ui/card';
import { Input } from '@shared/components/ui/input';
import { cn } from '@shared/lib/utils';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import CenteredError from '@shared/components/common/CenteredError';
import MentorCard from '@modules/mentorship/components/mentorship/MentorCard';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { getMentorProfile, getMentors, getMenteeMentorships } from '@modules/mentorship/services/mentorship.service';
import { profileService } from '@modules/profile/services/profile.service';
import { convertMentorProfileToMentor } from '@shared/utils/mentorship.utils';
import type { Mentor } from '@shared/types/mentor';

/**
 * Mentor directory browse page (was the Browse tab).
 */
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
        if (err?.code !== 'ERR_NETWORK') {
          console.error('Error checking mentor profile:', err);
        }
        setHasMentorProfile(false);
      }

      try {
        const mentorships = await getMenteeMentorships(user.id);
        const mentorIds = new Set(
          mentorships
            .filter(
              (m) =>
                m.requestStatus === 'PENDING' ||
                m.requestStatus === 'ACCEPTED' ||
                m.reviewStatus === 'ACTIVE'
            )
            .map((m) => m.mentorId)
        );
        setRequestedMentorIds(mentorIds);
      } catch (err) {
        console.error('Error fetching existing mentorships:', err);
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
                  },
                };
              }
            } catch (err: any) {
              if (err?.response?.status !== 404 && err?.code !== 'ERR_NETWORK') {
                console.warn(`Could not fetch profile for mentor ${mentor.id}:`, err);
              }
              mentorProfilesMap[mentor.id] = {};
            }
          })
        );

        const convertedMentors = backendMentors.map((mentor) =>
          convertMentorProfileToMentor(
            mentor,
            mentorProfilesMap[mentor.id]?.imageUrl,
            mentorProfilesMap[mentor.id]?.profile
          )
        );

        const filteredMentors = user?.id
          ? convertedMentors.filter((mentor) => mentor.id !== user.id.toString())
          : convertedMentors;

        setMentors(filteredMentors);
      } catch (err) {
        console.error('Error fetching mentors:', err);
        if (err && typeof err === 'object' && 'code' in err) {
          const axiosError = err as { code?: string; message?: string };
          if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
            setError(
              t('mentorship.errors.timeout') ||
                'Connection timeout. Please check if the backend server is running.'
            );
          } else if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('Network Error')) {
            setError(
              t('mentorship.errors.networkError') ||
                'Cannot connect to server. Please check if the backend is running.'
            );
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
  }, [user?.id, t]);

  const filteredMentors = useMemo(() => {
    if (!searchInput.trim()) {
      return mentors;
    }
    const searchLower = searchInput.toLowerCase();
    return mentors.filter(
      (mentor) =>
        mentor.name.toLowerCase().includes(searchLower) ||
        mentor.title.toLowerCase().includes(searchLower) ||
        mentor.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
        mentor.specialties.some((spec) => spec.toLowerCase().includes(searchLower))
    );
  }, [searchInput, mentors]);

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return <CenteredError message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-6 pb-24 lg:pb-8">
      <div className="mb-6 space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{t('mentorship.title')}</h1>
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
                  <Link to="/mentorship/mentor/create">{t('mentorship.becomeMentor')}</Link>
                </Button>
              )}
            </>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            type="text"
            placeholder={
              t('mentorship.searchPlaceholder') || 'Search mentors by name, expertise, or skills...'
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated && (
        <Card className="mb-6 gap-4 border-amber-200 bg-amber-50 py-4 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="space-y-4 px-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="flex-1 space-y-2">
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
            <div className="flex flex-col gap-3 sm:flex-row">
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

      {filteredMentors.length > 0 ? (
        <div
          className={cn(
            'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
            !isAuthenticated && 'pointer-events-none select-none opacity-60 blur-sm'
          )}
        >
          {filteredMentors.map((mentor) => {
            const mentorIdNum = parseInt(mentor.id, 10);
            const hasRequested = !Number.isNaN(mentorIdNum) && requestedMentorIds.has(mentorIdNum);
            return <MentorCard key={mentor.id} mentor={mentor} hasRequested={hasRequested} />;
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {t('mentorship.noResults') || 'No mentors found. Try adjusting your search.'}
            </p>
          </CardContent>
        </Card>
      )}

      {!isAuthenticated && (
        <div className="mt-6 text-center">
          <p className="mb-4 text-muted-foreground">{t('mentorship.authRequired.viewMore')}</p>
        </div>
      )}
    </div>
  );
};

export default MentorshipPage;
