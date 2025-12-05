import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { AboutSection } from '@modules/profile/components/profile/AboutSection';
import { ExperienceSection } from '@modules/profile/components/profile/ExperienceSection';
import { EducationSection } from '@modules/profile/components/profile/EducationSection';
import { ActivityTab } from '@modules/profile/components/profile/ActivityTab';
import { PostsTab } from '@modules/profile/components/profile/PostsTab';
import type { PublicProfile, Activity, Post } from '@shared/types/profile.types';
import { profileService } from '@modules/profile/services/profile.service';
import CenteredLoader from '@shared/components/common/CenteredLoader';

export default function PublicProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'posts'>('about');
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation('common');

  // Mock data for activity and posts (since these are not part of the public profile)
  const mockActivity: Activity[] = useMemo(() => [
    {
      id: 1,
      type: 'application',
      text: 'Applied to Senior Product Designer at Innovation Labs',
      date: '2 days ago'
    },
    {
      id: 2,
      type: 'forum',
      text: 'Posted a thread on forum: Best practices for accessibility in design',
      date: '5 days ago'
    },
    {
      id: 3,
      type: 'comment',
      text: 'Made a comment on Remote work strategies for designers',
      date: '1 week ago'
    },
  ], []);

  const mockPosts: Post[] = useMemo(() => [
    {
      id: 1,
      title: 'How to become a better designer',
      date: '2024-01-15',
      replies: 12,
      likes: 45,
    },
    {
      id: 2,
      title: 'Design system best practices',
      date: '2024-01-10',
      replies: 8,
      likes: 32,
    },
    {
      id: 3,
      title: 'Remote work tips for creative professionals',
      date: '2024-01-05',
      replies: 24,
      likes: 67,
    },
  ], []);

  useEffect(() => {
    const loadPublicProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const profileData = await profileService.getPublicProfile(parseInt(userId));
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to load public profile:', err);
        setError(t('profile.page.loadErrorTitle'));
        toast.error(t('profile.page.loadErrorTitle'));
      } finally {
        setLoading(false);
      }
    };

    loadPublicProfile();
  }, [userId, t]);

  if (loading) {
    return <CenteredLoader />;
  }

  if (error || !profile) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-16">
        <div className="bg-muted rounded-lg p-6 text-center">
          <p className="font-medium">
            {error || t('profile.page.emptyTitle')}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('profile.page.emptyDescription')}
          </p>
        </div>
      </div>
    );
  }

  const joinYear = new Date().getFullYear(); // Since public profile doesn't have createdAt, use current year
  const currentJob = profile.experiences.find((exp) => !exp.endDate);
  const currentRoleLabel = currentJob
    ? t('profile.header.currentRole', {
        position: currentJob.position,
        company: currentJob.company,
      })
    : t('profile.header.openToOpportunities');
  const joinedLabel = t('profile.header.joined', { year: joinYear });

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-16">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        {/* Public Profile Header */}
        <div className="flex items-start gap-6 pb-6">
          <div className="relative">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={profile.imageUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
              />
              <AvatarFallback className="text-3xl">
                {profile.firstName.charAt(0)}
                {profile.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {profile.firstName} {profile.lastName}
            </h1>

            <p className="text-muted-foreground mb-3">{currentRoleLabel}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{joinedLabel}</span>
              <span>•</span>
              <span>42 {t('profile.header.posts')}</span>
              <span>•</span>
              <span>5 {t('profile.header.badges')}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b mb-6">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('about')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'about'
                  ? 'border-green-600 text-green-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('profile.tabs.about')}
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'activity'
                  ? 'border-green-600 text-green-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('profile.tabs.activity')}
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`pb-3 border-b-2 transition-colors ${
                activeTab === 'posts'
                  ? 'border-green-600 text-green-600 font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('profile.tabs.posts')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* About Section - Read Only */}
              <AboutSection bio={profile.bio} isPublicView={true} />

              {/* Experience Section - Read Only */}
              <ExperienceSection
                experiences={profile.experiences.sort((a, b) => {
                  if (!a.endDate && b.endDate) return -1;
                  if (a.endDate && !b.endDate) return 1;
                  if (!a.endDate && !b.endDate) {
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                  }
                  const endDateA = a.endDate ? new Date(a.endDate) : new Date();
                  const endDateB = b.endDate ? new Date(b.endDate) : new Date();
                  return endDateB.getTime() - endDateA.getTime();
                })}
                isPublicView={true}
              />

              {/* Education Section - Read Only */}
              <EducationSection
                educations={profile.educations}
                isPublicView={true}
              />
            </div>

            <div className="space-y-6">
              {/* Public profiles don't include skills and interests */}
              <div className="text-muted-foreground text-sm">
                {t('profile.public.note')}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityTab activities={mockActivity} />}
        {activeTab === 'posts' && <PostsTab posts={mockPosts} />}
      </div>
    </div>
  );
}
