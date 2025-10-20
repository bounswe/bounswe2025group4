import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { AboutSection } from '@/components/profile/AboutSection';
import { ExperienceSection } from '@/components/profile/ExperienceSection';
import { EducationSection } from '@/components/profile/EducationSection';
import { SkillsSection } from '@/components/profile/SkillsSection';
import { InterestsSection } from '@/components/profile/InterestsSection';
import { ActivityTab } from '@/components/profile/ActivityTab';
import { PostsTab } from '@/components/profile/PostsTab';
import {
  EditBioModal,
  ExperienceModal,
  EducationModal,
  SkillModal,
  InterestModal,
  CreateProfileModal,
  ImageUploadModal,
} from '@/components/profile/ProfileEditModals';
import { DeleteAccountModal } from '@/components/profile/DeleteAccountModal';
import type { Profile, Activity, Post, Experience, Education, Skill, Interest } from '@/types/profile.types';
import { profileService } from '@/services/profile.service';
import CenteredLoader from '@/components/CenteredLoader';
import { useAuthStore } from '@/stores/authStore';

type ModalKey = 'bio' | 'experience' | 'education' | 'skill' | 'interest';

type ExperienceFormData = Omit<Experience, 'id'> & { id?: number; current?: boolean };
type EducationFormData = Omit<Education, 'id'> & { id?: number; current?: boolean };
type SkillFormData = Omit<Skill, 'id'> & { id?: number };
type InterestFormData = Omit<Interest, 'id'> & { id?: number };

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'posts'>('about');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { t } = useTranslation('common');
  const loadErrorFallback = t('profile.page.loadErrorTitle');

  const mockActivity: Activity[] = useMemo(() => {
    const items = t('profile.activity.items', {
      returnObjects: true,
    }) as Array<Pick<Activity, 'type' | 'text' | 'date'>>;

    return items.map((item, index) => ({
      id: index + 1,
      ...item,
    }));
  }, [t]);

  const mockPosts: Post[] = useMemo(() => {
    const items = t('profile.posts.items', {
      returnObjects: true,
    }) as Array<Pick<Post, 'title' | 'date'>>;

    const defaults = [
      { replies: 12, likes: 45 },
      { replies: 8, likes: 32 },
      { replies: 24, likes: 67 },
    ];

    return items.map((item, index) => ({
      id: index + 1,
      title: item.title,
      date: item.date,
      replies: defaults[index]?.replies ?? 0,
      likes: defaults[index]?.likes ?? 0,
    }));
  }, [t]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Debug: Check auth state
        console.log('ProfilePage: Loading profile...');
        const authState = useAuthStore.getState();
        console.log('ProfilePage: Auth state:', {
          isAuthenticated: authState.isAuthenticated,
          hasToken: !!authState.accessToken,
          user: authState.user,
        });

        const profileData = await profileService.getMyProfile();
        setProfile(profileData);
        console.log('ProfilePage: Profile loaded successfully');
      } catch (err) {
        console.error('Failed to load profile:', err);
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          response: (err as any)?.response?.data,
          status: (err as any)?.response?.status,
        });

        // Check if it's a profile not found error
        const errorResponse = (err as any)?.response?.data;
        const isProfileNotFound =
          (err as any)?.response?.status === 404 && errorResponse?.code === 'PROFILE_NOT_FOUND';

        if (isProfileNotFound) {
          console.log('ProfilePage: Profile not found, showing create modal');
          setShowCreateProfile(true);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : loadErrorFallback);
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [loadErrorFallback]);

  const [modals, setModals] = useState<Record<ModalKey, boolean>>({
    bio: false,
    experience: false,
    education: false,
    skill: false,
    interest: false,
  });
  const [editingExperience, setEditingExperience] = useState<ExperienceFormData | null>(null);
  const [editingEducation, setEditingEducation] = useState<EducationFormData | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillFormData | null>(null);
  const [editingInterest, setEditingInterest] = useState<InterestFormData | null>(null);

  const openModal = (type: ModalKey, item?: unknown) => {
    switch (type) {
      case 'experience':
        setEditingExperience((item as ExperienceFormData) ?? null);
        break;
      case 'education':
        setEditingEducation((item as EducationFormData) ?? null);
        break;
      case 'skill':
        setEditingSkill((item as SkillFormData) ?? null);
        break;
      case 'interest':
        setEditingInterest((item as InterestFormData) ?? null);
        break;
      case 'bio':
        break;
    }
    setModals((prev) => ({ ...prev, [type]: true }));
  };

  const closeModal = (type: ModalKey) => {
    setModals((prev) => ({ ...prev, [type]: false }));
    if (type === 'experience') setEditingExperience(null);
    if (type === 'education') setEditingEducation(null);
    if (type === 'skill') setEditingSkill(null);
    if (type === 'interest') setEditingInterest(null);
  };

  const handleCreateProfile = async (data: { firstName: string; lastName: string; bio?: string }) => {
    try {
      setLoading(true);
      const newProfile = await profileService.createProfile(data);
      setProfile(newProfile);
      setShowCreateProfile(false);
      console.log('ProfilePage: Profile created successfully');
    } catch (err) {
      console.error('Failed to create profile:', err);
      // You might want to show a toast notification here
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const result = await profileService.uploadImage(file);

      // Update profile with new image URL
      if (profile) {
        setProfile({
          ...profile,
          imageUrl: result.imageUrl,
          updatedAt: result.updatedAt,
        });
      }

      setShowImageUpload(false);
      console.log('ProfilePage: Image uploaded successfully');
    } catch (err) {
      console.error('Failed to upload image:', err);
      // You might want to show a toast notification here
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setIsUploadingImage(true);
      await profileService.deleteImage();

      // Update profile to remove image URL
      if (profile) {
        setProfile({
          ...profile,
          imageUrl: undefined,
          updatedAt: new Date().toISOString(),
        });
      }

      setShowImageUpload(false);
      console.log('ProfilePage: Image deleted successfully');
    } catch (err) {
      console.error('Failed to delete image:', err);
      // You might want to show a toast notification here
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await profileService.deleteExperience(id);
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      console.log('ProfilePage: Experience deleted successfully');
    } catch (err) {
      console.error('Failed to delete experience:', err);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await profileService.deleteEducation(id);
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      console.log('ProfilePage: Education deleted successfully');
    } catch (err) {
      console.error('Failed to delete education:', err);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await profileService.deleteSkill(id);
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      console.log('ProfilePage: Skill deleted successfully');
    } catch (err) {
      console.error('Failed to delete skill:', err);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteInterest = async (id: number) => {
    try {
      await profileService.deleteInterest(id);
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      console.log('ProfilePage: Interest deleted successfully');
    } catch (err) {
      console.error('Failed to delete interest:', err);
      // You might want to show a toast notification here
    }
  };

  const handleSaveBio = async (bio: string) => {
    try {
      const updatedProfile = await profileService.updateProfile({ bio });
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to update bio:', err);
      // You might want to show a toast notification here
    }
  };

  const handleSaveExperience = async (data: ExperienceFormData) => {
    try {
      if (data.id) {
        // Update existing
        await profileService.updateExperience(data.id, data);
      } else {
        // Add new
        await profileService.addExperience(data);
      }
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to save experience:', err);
      // You might want to show a toast notification here
    }
  };

  const handleSaveEducation = async (data: EducationFormData) => {
    try {
      if (data.id) {
        // Update existing
        await profileService.updateEducation(data.id, data);
      } else {
        // Add new
        await profileService.addEducation(data);
      }
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to save education:', err);
      // You might want to show a toast notification here
    }
  };

  const handleSaveSkill = async (data: SkillFormData) => {
    try {
      if (data.id) {
        // Update existing
        await profileService.updateSkill(data.id, data);
      } else {
        // Add new
        await profileService.addSkill(data);
      }
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to save skill:', err);
      // You might want to show a toast notification here
    }
  };

  const handleSaveInterest = async (data: InterestFormData) => {
    try {
      if (data.id) {
        // Update existing
        await profileService.updateInterest(data.id, data);
      } else {
        // Add new
        await profileService.addInterest(data);
      }
      // Refresh profile data
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
    } catch (err) {
      console.error('Failed to save interest:', err);
      // You might want to show a toast notification here
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await profileService.deleteAllProfileData();

      // Refresh the profile to show empty state
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);

      console.log('ProfilePage: All profile data deleted successfully');
      
      // Optionally, you could redirect the user or show a success message
      // For now, we'll just refresh the profile to show the empty state
    } catch (err) {
      console.error('Failed to delete profile data:', err);
      alert(t('profile.page.alerts.deleteFailed'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return <CenteredLoader />;
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-16">
        <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-6 text-center">
          <p className="font-medium">{t('profile.page.loadErrorTitle')}</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!profile && !showCreateProfile) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-16">
        <div className="bg-muted rounded-lg p-6 text-center">
          <p className="font-medium">{t('profile.page.emptyTitle')}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {t('profile.page.emptyDescription')}
          </p>
        </div>
      </div>
    );
  }

  // Show create profile modal if profile doesn't exist
  if (showCreateProfile) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-16">
        <CreateProfileModal
          isOpen={showCreateProfile}
          onClose={() => setShowCreateProfile(false)}
          onSave={handleCreateProfile}
        />
      </div>
    );
  }

  // Profile must exist at this point
  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-16">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        <ProfileHeader
          firstName={profile.firstName}
          lastName={profile.lastName}
          imageUrl={profile.imageUrl}
          createdAt={profile.createdAt}
          experiences={profile.experiences}
          onEditImage={() => setShowImageUpload(true)}
        />

        {/* Tabs */}
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
              <AboutSection bio={profile.bio} onEdit={() => openModal('bio')} />

              <ExperienceSection
                experiences={profile.experiences.sort((a, b) => {
                  // Current jobs (no endDate) should be first
                  if (!a.endDate && b.endDate) return -1;
                  if (a.endDate && !b.endDate) return 1;
                  if (!a.endDate && !b.endDate) {
                    // If both are current, sort by startDate descending
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
                  }

                  // Both have endDates, sort by endDate descending (most recent first)
                  const endDateA = a.endDate ? new Date(a.endDate) : new Date();
                  const endDateB = b.endDate ? new Date(b.endDate) : new Date();
                  return endDateB.getTime() - endDateA.getTime();
                })}
                onAdd={() => openModal('experience')}
                onEdit={(id) => {
                  const exp = profile.experiences.find((e) => e.id === id);
                  console.log('Editing experience:', exp);
                  openModal('experience', exp);
                }}
                onDelete={handleDeleteExperience}
              />

              <EducationSection
                educations={profile.educations}
                onAdd={() => openModal('education')}
                onEdit={(id) => {
                  const edu = profile.educations.find((e) => e.id === id);
                  openModal('education', edu);
                }}
                onDelete={handleDeleteEducation}
              />

              {/* Danger Zone */}
              <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
                <h4 className="text-sm font-medium text-destructive mb-2">
                  {t('profile.page.dangerZone.title')}
                </h4>
                <p className="text-xs text-muted-foreground mb-3">
                  {t('profile.page.dangerZone.description')}
                </p>
                <button
                  onClick={() => setShowDeleteAccount(true)}
                  className="px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors"
                >
                  {t('profile.page.dangerZone.button')}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <SkillsSection
                skills={profile.skills}
                onAdd={() => openModal('skill')}
                onEdit={(id) => {
                  const skill = profile.skills.find((s) => s.id === id);
                  openModal('skill', skill);
                }}
              />

              <InterestsSection
                interests={profile.interests}
                onAdd={() => openModal('interest')}
                onEdit={(id) => {
                  const interest = profile.interests.find((i) => i.id === id);
                  openModal('interest', interest);
                }}
              />
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityTab activities={mockActivity} />}
        {activeTab === 'posts' && <PostsTab posts={mockPosts} />}
      </div>

      {/* Modals */}
      <EditBioModal
        isOpen={modals.bio}
        onClose={() => closeModal('bio')}
        initialBio={profile.bio}
        onSave={handleSaveBio}
      />

      <ExperienceModal
        isOpen={modals.experience}
        onClose={() => closeModal('experience')}
        experience={editingExperience}
        onSave={handleSaveExperience}
      />

      <EducationModal
        isOpen={modals.education}
        onClose={() => closeModal('education')}
        education={editingEducation}
        onSave={handleSaveEducation}
      />

      <SkillModal
        isOpen={modals.skill}
        onClose={() => closeModal('skill')}
        skill={editingSkill}
        onSave={handleSaveSkill}
        onDelete={handleDeleteSkill}
      />

      <InterestModal
        isOpen={modals.interest}
        onClose={() => closeModal('interest')}
        interest={editingInterest}
        onSave={handleSaveInterest}
        onDelete={handleDeleteInterest}
      />

      <ImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        currentImageUrl={profile?.imageUrl}
        onUpload={handleImageUpload}
        onDelete={profile?.imageUrl ? handleImageDelete : undefined}
        isUploading={isUploadingImage}
      />

      <DeleteAccountModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeletingAccount}
      />
    </div>
  );
}
