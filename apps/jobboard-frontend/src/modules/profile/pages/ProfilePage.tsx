import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthContext } from '@modules/auth/contexts/AuthContext';
import { useReportModal } from '@shared/hooks/useReportModal';
import { createReport, mapReportReason } from '@shared/services/report.service';
import { Flag } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { ProfileHeader } from '@modules/profile/components/profile/ProfileHeader';
import { AboutSection } from '@modules/profile/components/profile/AboutSection';
import { ExperienceSection } from '@modules/profile/components/profile/ExperienceSection';
import { EducationSection } from '@modules/profile/components/profile/EducationSection';
import { SkillsSection } from '@modules/profile/components/profile/SkillsSection';
import { InterestsSection } from '@modules/profile/components/profile/InterestsSection';
import { ActivityTab } from '@modules/profile/components/profile/ActivityTab';
import { PostsTab } from '@modules/profile/components/profile/PostsTab';
import {
  EditBioModal,
  ExperienceModal,
  EducationModal,
  SkillModal,
  InterestModal,
  CreateProfileModal,
  ImageUploadModal,
} from '@modules/profile/components/profile/ProfileEditModals';
import { DeleteAccountModal } from '@modules/profile/components/profile/DeleteAccountModal';
import type { Profile, PublicProfile, Activity, Post, Experience, Education, Skill, Interest } from '@shared/types/profile.types';
import {
  profileService,
  useCreateProfileMutationWithToasts,
  useDeleteEducationMutationWithOptimistic,
  useDeleteExperienceMutationWithOptimistic,
  useDeleteInterestMutationWithOptimistic,
  useDeleteSkillMutationWithOptimistic,
  useMyProfileQuery,
  usePublicProfileQuery,
  useSaveEducationMutationWithOptimistic,
  useSaveExperienceMutationWithOptimistic,
  useSaveInterestMutationWithOptimistic,
  useSaveSkillMutationWithOptimistic,
  useUpdateBioMutationWithOptimistic,
} from '@modules/profile/services/profile.service';
import { profileKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import CenteredLoader from '@shared/components/common/CenteredLoader';

type ModalKey = 'bio' | 'experience' | 'education' | 'skill' | 'interest';

type ExperienceFormData = Omit<Experience, 'id'> & { id?: number; current?: boolean };
type EducationFormData = Omit<Education, 'id'> & { id?: number; current?: boolean };
type SkillFormData = Omit<Skill, 'id'> & { id?: number };
type InterestFormData = Omit<Interest, 'id'> & { id?: number };

export default function ProfilePage() {
  const { user } = useAuthContext();
  const { userId: routeUserId } = useParams<{ userId?: string }>();
  const [activeTab, setActiveTab] = useState<'about' | 'activity' | 'posts'>('about');
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const { t } = useTranslation('common');
  const queryClient = useQueryClient();
  const { openReport, ReportModalElement } = useReportModal();

  const viewedUserId = routeUserId ? Number(routeUserId) : undefined;
  const isOwner = user ? (!viewedUserId || user.id === viewedUserId) : false;

  const myProfileQuery = useMyProfileQuery(isOwner);
  const publicProfileQuery = usePublicProfileQuery(viewedUserId, !isOwner);
  const profile = (isOwner ? myProfileQuery.data : publicProfileQuery.data) as Profile | PublicProfile | undefined;

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
    if (!isOwner) {
      setShowCreateProfile(false);
      return;
    }

    if (myProfileQuery.data) {
      setShowCreateProfile(false);
      return;
    }

    if (myProfileQuery.isError) {
      const normalized = normalizeApiError(myProfileQuery.error);
      if (normalized.code === 'PROFILE_NOT_FOUND' || normalized.status === 404) {
        setShowCreateProfile(true);
      }
    }
  }, [isOwner, myProfileQuery.data, myProfileQuery.error, myProfileQuery.isError]);

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

  const createProfileMutation = useCreateProfileMutationWithToasts({
    success: () => t('profile.notifications.createSuccess'),
    error: () => t('profile.notifications.createError'),
  });

  const updateBioMutation = useUpdateBioMutationWithOptimistic({
    success: () => t('profile.notifications.saveBioSuccess'),
    error: () => t('profile.notifications.saveBioError'),
  });

  const saveExperienceMutation = useSaveExperienceMutationWithOptimistic({
    success: () => t('profile.notifications.saveExperienceSuccess'),
    error: () => t('profile.notifications.saveExperienceError'),
  });

  const deleteExperienceMutation = useDeleteExperienceMutationWithOptimistic({
    success: () => t('profile.notifications.deleteExperienceSuccess'),
    error: () => t('profile.notifications.deleteExperienceError'),
  });

  const saveEducationMutation = useSaveEducationMutationWithOptimistic({
    success: () => t('profile.notifications.saveEducationSuccess'),
    error: () => t('profile.notifications.saveEducationError'),
  });

  const deleteEducationMutation = useDeleteEducationMutationWithOptimistic({
    success: () => t('profile.notifications.deleteEducationSuccess'),
    error: () => t('profile.notifications.deleteEducationError'),
  });

  const saveSkillMutation = useSaveSkillMutationWithOptimistic({
    success: () => t('profile.notifications.saveSkillSuccess'),
    error: () => t('profile.notifications.saveSkillError'),
  });

  const deleteSkillMutation = useDeleteSkillMutationWithOptimistic({
    success: () => t('profile.notifications.deleteSkillSuccess'),
    error: () => t('profile.notifications.deleteSkillError'),
  });

  const saveInterestMutation = useSaveInterestMutationWithOptimistic({
    success: () => t('profile.notifications.saveInterestSuccess'),
    error: () => t('profile.notifications.saveInterestError'),
  });

  const deleteInterestMutation = useDeleteInterestMutationWithOptimistic({
    success: () => t('profile.notifications.deleteInterestSuccess'),
    error: () => t('profile.notifications.deleteInterestError'),
  });

  const openModal = (type: ModalKey, item?: unknown) => {
    if (!isOwner) return;
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
    await createProfileMutation.mutateAsync(data);
    setShowCreateProfile(false);
  };

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploadingImage(true);
      const result = await profileService.uploadImage(file);
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, {
          ...previousProfile,
          imageUrl: result.imageUrl,
          updatedAt: result.updatedAt,
        });
      }
      setShowImageUpload(false);
      toast.success(t('profile.notifications.imageUploadSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.imageUploadError'));
    } finally {
      setIsUploadingImage(false);
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    }
  };

  const handleImageDelete = async () => {
    try {
      setIsUploadingImage(true);
      await profileService.deleteImage();
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, {
          ...previousProfile,
          imageUrl: undefined,
          updatedAt: new Date().toISOString(),
        });
      }
      setShowImageUpload(false);
      toast.success(t('profile.notifications.imageDeleteSuccess'));
    } catch (_err) {
      toast.error(t('profile.notifications.imageDeleteError'));
    } finally {
      setIsUploadingImage(false);
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    }
  };

  const handleDeleteExperience = async (id: number) => {
    await deleteExperienceMutation.mutateAsync(id);
  };

  const handleDeleteEducation = async (id: number) => {
    await deleteEducationMutation.mutateAsync(id);
  };

  const handleDeleteSkill = async (id: number) => {
    await deleteSkillMutation.mutateAsync(id);
  };

  const handleDeleteInterest = async (id: number) => {
    await deleteInterestMutation.mutateAsync(id);
  };

  const handleSaveBio = async (bio: string) => {
    await updateBioMutation.mutateAsync(bio);
  };

  const handleSaveExperience = async (data: ExperienceFormData) => {
    await saveExperienceMutation.mutateAsync(data);
  };

  const handleSaveEducation = async (data: EducationFormData) => {
    await saveEducationMutation.mutateAsync(data);
  };

  const handleSaveSkill = async (data: SkillFormData) => {
    await saveSkillMutation.mutateAsync(data);
  };

  const handleSaveInterest = async (data: InterestFormData) => {
    await saveInterestMutation.mutateAsync(data);
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeletingAccount(true);
      await profileService.deleteAllProfileData();
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success(t('profile.notifications.deleteAccountSuccess'));
      setShowCreateProfile(true);
    } catch (_err) {
      toast.error(t('profile.page.alerts.deleteFailed'));
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const sortExperiences = (experiences: Experience[]) =>
    experiences.slice().sort((a, b) => {
      if (!a.endDate && b.endDate) return -1;
      if (a.endDate && !b.endDate) return 1;
      if (!a.endDate && !b.endDate) {
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      }
      const endDateA = a.endDate ? new Date(a.endDate) : new Date();
      const endDateB = b.endDate ? new Date(b.endDate) : new Date();
      return endDateB.getTime() - endDateA.getTime();
    });

  if ((isOwner && myProfileQuery.isLoading) || (!isOwner && publicProfileQuery.isLoading)) {
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

  const ownerProfile = isOwner ? (profile as Profile) : undefined;
  const publicProfile = !isOwner ? (profile as PublicProfile) : undefined;
  const experiences = profile.experiences ? sortExperiences(profile.experiences) : [];
  const currentJob = profile.experiences?.find((exp) => !exp.endDate);
  const joinedLabel = !isOwner
    ? t('profile.header.joined', { year: new Date().getFullYear() })
    : undefined;
  const currentRoleLabel =
    !isOwner && currentJob
      ? t('profile.header.currentRole', {
          position: currentJob.position,
          company: currentJob.company,
        })
      : !isOwner
        ? t('profile.header.openToOpportunities')
        : undefined;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-16">
      <div className="bg-card rounded-lg border shadow-sm p-6">
        {isOwner ? (
          <ProfileHeader
            onReport={
              !isOwner && viewedUserId
                ? () => {
                    openReport({
                      title: t('profile.report', { defaultValue: 'Report Profile' }),
                      subtitle: t('profile.reportSubtitle', { defaultValue: 'Report this profile if it violates our guidelines' }),
                      contextSnippet: `${profile.firstName} ${profile.lastName}`,
                      reportType: 'Profile',
                      reportedName: `${profile.firstName} ${profile.lastName}`,
                      onSubmit: async (message, reason) => {
                        await createReport({
                          entityType: 'PROFILE',
                          entityId: viewedUserId!,
                          reasonType: mapReportReason(reason),
                          description: message,
                        });
                      },
                    });
                  }
                : undefined
            }
            showReport={!isOwner && Boolean(viewedUserId)}
            firstName={ownerProfile?.firstName || ''}
            lastName={ownerProfile?.lastName || ''}
            imageUrl={ownerProfile?.imageUrl}
            createdAt={ownerProfile?.createdAt || ''}
            experiences={ownerProfile?.experiences || []}
            onEditImage={() => setShowImageUpload(true)}
          />
        ) : (
          <div className="flex items-start gap-6 pb-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full overflow-hidden bg-muted flex items-center justify-center text-3xl font-semibold text-muted-foreground">
                {publicProfile?.imageUrl ? (
                  <img
                    src={publicProfile.imageUrl}
                    alt={`${publicProfile.firstName} ${publicProfile.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    {publicProfile?.firstName?.charAt(0)}
                    {publicProfile?.lastName?.charAt(0)}
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    {publicProfile?.firstName} {publicProfile?.lastName}
                  </h1>
                  <p className="text-muted-foreground mt-1">{currentRoleLabel}</p>
                </div>
                {viewedUserId && (
                  <button
                    onClick={() => {
                      openReport({
                        title: t('profile.report', { defaultValue: 'Report Profile' }),
                        subtitle: t('profile.reportSubtitle', { defaultValue: 'Report this profile if it violates our guidelines' }),
                        contextSnippet: `${publicProfile?.firstName} ${publicProfile?.lastName}`,
                        reportType: 'Profile',
                        reportedName: `${publicProfile?.firstName} ${publicProfile?.lastName}`,
                        onSubmit: async (message, reason) => {
                          await createReport({
                            entityType: 'PROFILE',
                            entityId: viewedUserId,
                            reasonType: mapReportReason(reason),
                            description: message,
                          });
                        },
                      });
                    }}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    title={t('profile.report', { defaultValue: 'Report' })}
                  >
                    <Flag className="h-4 w-4" />
                    <span className="sr-only">{t('profile.report', { defaultValue: 'Report' })}</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {joinedLabel && <span>{joinedLabel}</span>}
                <span>•</span>
                <span>42 {t('profile.header.posts')}</span>
                <span>•</span>
                <span>5 {t('profile.header.badges')}</span>
              </div>
            </div>
          </div>
        )}

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
              {isOwner ? (
                <AboutSection bio={ownerProfile?.bio} onEdit={() => openModal('bio')} />
              ) : (
                <AboutSection bio={publicProfile?.bio} isPublicView />
              )}

              <ExperienceSection
                experiences={experiences}
                onAdd={isOwner ? () => openModal('experience') : undefined}
                onEdit={
                  isOwner
                    ? (id) => {
                        const exp = ownerProfile?.experiences.find((e) => e.id === id);
                        openModal('experience', exp);
                      }
                    : undefined
                }
                onDelete={isOwner ? handleDeleteExperience : undefined}
                isPublicView={!isOwner}
              />

              <EducationSection
                educations={profile.educations}
                onAdd={isOwner ? () => openModal('education') : undefined}
                onEdit={
                  isOwner
                    ? (id) => {
                        const edu = ownerProfile?.educations.find((e) => e.id === id);
                        openModal('education', edu);
                      }
                    : undefined
                }
                onDelete={isOwner ? handleDeleteEducation : undefined}
                isPublicView={!isOwner}
              />

              {isOwner && (
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
              )}
            </div>

            <div className="space-y-6">
              {isOwner ? (
                <>
                  <SkillsSection
                    skills={ownerProfile?.skills || []}
                    onAdd={() => openModal('skill')}
                    onEdit={(id) => {
                      const skill = ownerProfile?.skills.find((s) => s.id === id);
                      openModal('skill', skill);
                    }}
                  />

                  <InterestsSection
                    interests={ownerProfile?.interests || []}
                    onAdd={() => openModal('interest')}
                    onEdit={(id) => {
                      const interest = ownerProfile?.interests.find((i) => i.id === id);
                      openModal('interest', interest);
                    }}
                  />
                </>
              ) : (
                <div className="text-muted-foreground text-sm">
                  {t('profile.public.note')}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'activity' && <ActivityTab activities={mockActivity} />}
        {activeTab === 'posts' && <PostsTab posts={mockPosts} />}
      </div>

      {isOwner && (
        <>
          <EditBioModal
            isOpen={modals.bio}
            onClose={() => closeModal('bio')}
            initialBio={ownerProfile?.bio}
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
            currentImageUrl={ownerProfile?.imageUrl}
            onUpload={handleImageUpload}
            onDelete={ownerProfile?.imageUrl ? handleImageDelete : undefined}
            isUploading={isUploadingImage}
          />

          <DeleteAccountModal
            isOpen={showDeleteAccount}
            onClose={() => setShowDeleteAccount(false)}
            onConfirm={handleDeleteAccount}
            isDeleting={isDeletingAccount}
          />
        </>
      )}
      {ReportModalElement}
    </div>
  );
}
