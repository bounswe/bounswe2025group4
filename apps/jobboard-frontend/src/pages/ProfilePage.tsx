import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
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

type ModalKey = 'bio' | 'experience' | 'education' | 'skill' | 'interest';

type ExperienceFormData = Omit<Experience, 'id'> & { id?: number; current?: boolean };
type EducationFormData = Omit<Education, 'id'> & { id?: number; current?: boolean };
type SkillFormData = Omit<Skill, 'id'> & { id?: number };
type InterestFormData = Omit<Interest, 'id'> & { id?: number };

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'posts'>('about');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { t } = useTranslation('common');

  const mockActivity: Activity[] = useMemo(() => [
    {
      id: 1,
      type: 'application',
      text: 'Applied to Senior Product Designer at Innovation Labs',
      date: '2 days ago',
    },
    {
      id: 2,
      type: 'forum',
      text: "Posted a thread on forum: 'Best practices for accessibility in design'",
      date: '5 days ago',
    },
    {
      id: 3,
      type: 'comment',
      text: "Made a comment on 'Remote work strategies for designers'",
      date: '1 week ago',
    },
    {
      id: 4,
      type: 'like',
      text: "Liked a comment on 'Design system implementation'",
      date: '1 week ago',
    },
    {
      id: 5,
      type: 'application',
      text: 'Applied to UX Designer at Creative Studio',
      date: '2 weeks ago',
    },
  ], []);

  const mockPosts: Post[] = useMemo(() => [
    {
      id: 1,
      title: 'User Research Techniques: A Comprehensive Guide',
      date: '3 days ago',
      replies: 12,
      likes: 45,
    },
    {
      id: 2,
      title: 'My Design Journey: From Student to Professional',
      date: '1 week ago',
      replies: 8,
      likes: 32,
    },
    {
      id: 3,
      title: 'Essential Daily Tools for Modern Designers',
      date: '2 weeks ago',
      replies: 24,
      likes: 67,
    },
  ], []);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await profileService.getMyProfile();
        setProfile(profileData);
      } catch (err) {
        const errorResponse = (err as unknown as { response?: { data?: unknown } })?.response?.data;
        const isProfileNotFound =
          (err as unknown as { response?: { status?: number } })?.response?.status === 404 && (errorResponse as { code?: string })?.code === 'PROFILE_NOT_FOUND';

        if (isProfileNotFound) {
          setShowCreateProfile(true);
        } else {
          toast.error(t('profile.page.loadErrorTitle'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [t]);

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
      toast.success(t('profile.notifications.createSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const result = await profileService.uploadImage(file);
      if (profile) {
        setProfile({ ...profile, imageUrl: result.imageUrl, updatedAt: result.updatedAt });
      }
      setShowImageUpload(false);
      toast.success(t('profile.notifications.imageUploadSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.imageUploadError'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      setIsUploadingImage(true);
      await profileService.deleteImage();
      if (profile) {
        setProfile({ ...profile, imageUrl: undefined, updatedAt: new Date().toISOString() });
      }
      setShowImageUpload(false);
      toast.success(t('profile.notifications.imageDeleteSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.imageDeleteError'));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      await profileService.deleteExperience(id);
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.deleteExperienceSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.deleteExperienceError'));
    }
  };

  const handleDeleteEducation = async (id: number) => {
    try {
      await profileService.deleteEducation(id);
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.deleteEducationSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.deleteEducationError'));
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      await profileService.deleteSkill(id);
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.deleteSkillSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.deleteSkillError'));
    }
  };

  const handleDeleteInterest = async (id: number) => {
    try {
      await profileService.deleteInterest(id);
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.deleteInterestSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.deleteInterestError'));
    }
  };

  const handleSaveBio = async (bio: string) => {
    try {
      const updatedProfile = await profileService.updateProfile({ bio });
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.saveBioSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.saveBioError'));
    }
  };

  const handleSaveExperience = async (data: ExperienceFormData) => {
    try {
      if (data.id) {
        await profileService.updateExperience(data.id, data);
      } else {
        await profileService.addExperience(data);
      }
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.saveExperienceSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.saveExperienceError'));
    }
  };

  const handleSaveEducation = async (data: EducationFormData) => {
    try {
      if (data.id) {
        await profileService.updateEducation(data.id, data);
      } else {
        await profileService.addEducation(data);
      }
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.saveEducationSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.saveEducationError'));
    }
  };

  const handleSaveSkill = async (data: SkillFormData) => {
    try {
      if (data.id) {
        await profileService.updateSkill(data.id, data);
      } else {
        await profileService.addSkill(data);
      }
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.saveSkillSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.saveSkillError'));
    }
  };

  const handleSaveInterest = async (data: InterestFormData) => {
    try {
      if (data.id) {
        await profileService.updateInterest(data.id, data);
      } else {
        await profileService.addInterest(data);
      }
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.saveInterestSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.saveInterestError'));
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await profileService.deleteAllProfileData();
      const updatedProfile = await profileService.getMyProfile();
      setProfile(updatedProfile);
      toast.success(t('profile.notifications.deleteAccountSuccess'));
    } catch (_err) {
      toast.error(t('profile.page.alerts.deleteFailed'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (loading) {
    return <CenteredLoader />;
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

        {activeTab === 'about' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <AboutSection bio={profile.bio} onEdit={() => openModal('bio')} />

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
                onAdd={() => openModal('experience')}
                onEdit={(id) => {
                  const exp = profile.experiences.find((e) => e.id === id);
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
