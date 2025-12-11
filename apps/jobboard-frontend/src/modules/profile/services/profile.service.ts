import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { apiClient } from '@shared/lib/api-client';
import { profileKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type { Profile, PublicProfile, Experience, Education, Skill, Interest } from '@shared/types/profile.types';

type ToastMessages = {
  success: () => string;
  error: () => string;
};

type ExperienceFormData = Omit<Experience, 'id'> & { id?: number; current?: boolean };
type EducationFormData = Omit<Education, 'id'> & { id?: number; current?: boolean };
type SkillFormData = Omit<Skill, 'id'> & { id?: number };
type InterestFormData = Omit<Interest, 'id'> & { id?: number };

const normalizeExperiencePayload = (data: ExperienceFormData) => {
  const { id: _id, current, ...rest } = data;
  return { ...rest, endDate: current ? undefined : rest.endDate };
};

const normalizeEducationPayload = (data: EducationFormData) => {
  const { id: _id, current, ...rest } = data;
  return { ...rest, endDate: current ? undefined : rest.endDate };
};

/**
 * Profile API Service
 * Handles all profile-related API calls
 */

// ==================== PROFILE ====================

export const profileService = {
  /**
   * Create user profile
   * POST /api/profile
   */
  createProfile: async (data: {
    firstName: string;
    lastName: string;
    bio?: string;
  }): Promise<Profile> => {
    const response = await apiClient.post('/profile', data);
    return response.data;
  },

  /**
   * Get current user's profile
   * GET /profile
   */
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/profile');
    return response.data;
  },

  /**
   * Update profile
   * PUT /profile
   */
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  }): Promise<Profile> => {
    const response = await apiClient.put('/profile', data);
    return response.data;
  },

  /**
   * Get public profile by user ID
   * GET /profile/{userId}
   */
  getPublicProfile: async (userId: number): Promise<PublicProfile> => {
    const response = await apiClient.get(`/profile/${userId}`);
    return response.data;
  },

  // ==================== IMAGE ====================

  /**
   * Upload profile image
   * POST /profile/image
   */
  uploadImage: async (file: File): Promise<{ imageUrl: string; updatedAt: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete profile image
   * DELETE /profile/image
   */
  deleteImage: async (): Promise<void> => {
    await apiClient.delete('/profile/image');
  },

  // ==================== EDUCATION ====================

  /**
   * Add education
   * POST /profile/education
   */
  addEducation: async (data: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/profile/education', data);
    return response.data;
  },

  /**
   * Update education
   * PUT /profile/education/{educationId}
   */
  updateEducation: async (
    educationId: number,
    data: {
      school?: string;
      degree?: string;
      field?: string;
      startDate?: string;
      endDate?: string;
      description?: string;
    }
  ) => {
    const response = await apiClient.put(`/profile/education/${educationId}`, data);
    return response.data;
  },

  /**
   * Delete education
   * DELETE /profile/education/{educationId}
   */
  deleteEducation: async (educationId: number): Promise<void> => {
    await apiClient.delete(`/profile/education/${educationId}`);
  },

  // ==================== EXPERIENCE ====================

  /**
   * Add experience
   * POST /profile/experience
   */
  addExperience: async (data: {
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
  }) => {
    const response = await apiClient.post('/profile/experience', data);
    return response.data;
  },

  /**
   * Update experience
   * PUT /profile/experience/{experienceId}
   */
  updateExperience: async (
    experienceId: number,
    data: {
      company?: string;
      position?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => {
    const response = await apiClient.put(`/profile/experience/${experienceId}`, data);
    return response.data;
  },

  /**
   * Delete experience
   * DELETE /profile/experience/{experienceId}
   */
  deleteExperience: async (experienceId: number): Promise<void> => {
    await apiClient.delete(`/profile/experience/${experienceId}`);
  },

  // ==================== SKILL ====================

  /**
   * Add skill
   * POST /profile/skill
   */
  addSkill: async (data: { name: string; level?: string }) => {
    const response = await apiClient.post('/profile/skill', data);
    return response.data;
  },

  /**
   * Update skill
   * PUT /profile/skill/{skillId}
   */
  updateSkill: async (
    skillId: number,
    data: { name?: string; level?: string }
  ) => {
    const response = await apiClient.put(`/profile/skill/${skillId}`, data);
    return response.data;
  },

  /**
   * Delete skill
   * DELETE /profile/skill/{skillId}
   */
  deleteSkill: async (skillId: number): Promise<void> => {
    await apiClient.delete(`/profile/skill/${skillId}`);
  },

  // ==================== INTEREST ====================

  /**
   * Add interest
   * POST /profile/interest
   */
  addInterest: async (data: { name: string }) => {
    const response = await apiClient.post('/profile/interest', data);
    return response.data;
  },

  /**
   * Update interest
   * PUT /profile/interest/{interestId}
   */
  updateInterest: async (interestId: number, data: { name: string }) => {
    const response = await apiClient.put(`/profile/interest/${interestId}`, data);
    return response.data;
  },

  /**
   * Delete interest
   * DELETE /profile/interest/{interestId}
   */
  deleteInterest: async (interestId: number): Promise<void> => {
    await apiClient.delete(`/profile/interest/${interestId}`);
  },

  // ==================== ACCOUNT DELETION ====================

  /**
   * Delete all profile data (GDPR/KVKK compliance)
   * This will delete:
   * - Profile image
   * - All experiences
   * - All educations
   * - All skills
   * - All interests
   * - Bio (by updating to empty)
   */
  deleteAllProfileData: async (): Promise<void> => {
    try {
      // Get current profile to know what needs to be deleted
      const profile = await profileService.getMyProfile();

      // Delete profile image if exists
      if (profile.imageUrl) {
        try {
          await profileService.deleteImage();
        } catch (err) {
          console.warn('Failed to delete profile image:', err);
        }
      }

      // Delete all experiences
      for (const experience of profile.experiences) {
        try {
          await profileService.deleteExperience(experience.id);
        } catch (err) {
          console.warn(`Failed to delete experience ${experience.id}:`, err);
        }
      }

      // Delete all educations
      for (const education of profile.educations) {
        try {
          await profileService.deleteEducation(education.id);
        } catch (err) {
          console.warn(`Failed to delete education ${education.id}:`, err);
        }
      }

      // Delete all skills
      for (const skill of profile.skills) {
        try {
          await profileService.deleteSkill(skill.id);
        } catch (err) {
          console.warn(`Failed to delete skill ${skill.id}:`, err);
        }
      }

      // Delete all interests
      for (const interest of profile.interests) {
        try {
          await profileService.deleteInterest(interest.id);
        } catch (err) {
          console.warn(`Failed to delete interest ${interest.id}:`, err);
        }
      }

      // Clear bio by updating to empty string
      try {
        await profileService.updateProfile({ bio: '' });
      } catch (err) {
        console.warn('Failed to clear bio:', err);
      }

      //console.log('All profile data deleted successfully');
    } catch (err) {
      console.error('Failed to delete profile data:', err);
      throw new Error('Failed to delete profile data. Please try again.');
    }
  },
};

export const useCreateProfileMutationWithToasts = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success(messages.success());
    },
    onError: () => toast.error(messages.error()),
  });
};

export const useUpdateBioMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bio: string) => profileService.updateProfile({ bio }),
    onMutate: async (bio) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, { ...previousProfile, bio });
      }
      return { previousProfile };
    },
    onError: (_err, _bio, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: (data) => {
      queryClient.setQueryData(profileKeys.me, data);
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useSaveExperienceMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ExperienceFormData) => {
      const payload = normalizeExperiencePayload(data);
      if (data.id) {
        await profileService.updateExperience(data.id, payload);
        return { kind: 'update' as const, experience: { ...payload, id: data.id } };
      }
      const created = await profileService.addExperience(payload);
      return { kind: 'create' as const, experience: created };
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile) return { previousProfile };

      const payload = normalizeExperiencePayload(data);
      const optimisticExperience: Experience = {
        id: data.id ?? Number(`-1${Date.now()}`),
        ...payload,
      };

      const updatedExperiences = data.id
        ? previousProfile.experiences.map((exp) =>
            exp.id === data.id ? { ...exp, ...optimisticExperience } : exp
          )
        : [...previousProfile.experiences, optimisticExperience];

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        experiences: updatedExperiences,
      });

      return { previousProfile };
    },
    onError: (_err, _data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: (result) => {
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile || !result?.experience) {
        toast.success(messages.success());
        return;
      }

      const cleanExperiences =
        result.kind === 'create'
          ? previousProfile.experiences.filter((exp) => !String(exp.id).startsWith('-1'))
          : previousProfile.experiences;

      const nextExperiences =
        result.kind === 'create'
          ? [...cleanExperiences, result.experience]
          : cleanExperiences.map((exp) =>
              exp.id === result.experience.id ? result.experience : exp
            );

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        experiences: nextExperiences,
      });
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useDeleteExperienceMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileService.deleteExperience(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, {
          ...previousProfile,
          experiences: previousProfile.experiences.filter((exp) => exp.id !== id),
        });
      }
      return { previousProfile };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: () => {
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useSaveEducationMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: EducationFormData) => {
      const payload = normalizeEducationPayload(data);
      if (data.id) {
        await profileService.updateEducation(data.id, payload);
        return { kind: 'update' as const, education: { ...payload, id: data.id } };
      }
      const created = await profileService.addEducation(payload);
      return { kind: 'create' as const, education: created };
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile) return { previousProfile };

      const payload = normalizeEducationPayload(data);
      const optimisticEducation: Education = {
        id: data.id ?? Number(`-1${Date.now()}`),
        ...payload,
      };

      const updatedEducations = data.id
        ? previousProfile.educations.map((edu) =>
            edu.id === data.id ? { ...edu, ...optimisticEducation } : edu
          )
        : [...previousProfile.educations, optimisticEducation];

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        educations: updatedEducations,
      });

      return { previousProfile };
    },
    onError: (_err, _data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: (result) => {
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile || !result?.education) {
        toast.success(messages.success());
        return;
      }

      const cleanEducations =
        result.kind === 'create'
          ? previousProfile.educations.filter((edu) => !String(edu.id).startsWith('-1'))
          : previousProfile.educations;

      const nextEducations =
        result.kind === 'create'
          ? [...cleanEducations, result.education]
          : cleanEducations.map((edu) =>
              edu.id === result.education.id ? result.education : edu
            );

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        educations: nextEducations,
      });
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useDeleteEducationMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileService.deleteEducation(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, {
          ...previousProfile,
          educations: previousProfile.educations.filter((edu) => edu.id !== id),
        });
      }
      return { previousProfile };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: () => {
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useSaveSkillMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: SkillFormData) => {
      if (data.id) {
        await profileService.updateSkill(data.id, data);
        return { kind: 'update' as const, skill: { ...data, id: data.id } };
      }
      const created = await profileService.addSkill(data);
      return { kind: 'create' as const, skill: created };
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile) return { previousProfile };

      const optimisticSkill: Skill = {
        id: data.id ?? Number(`-1${Date.now()}`),
        name: data.name,
        level: data.level,
      };

      const updatedSkills = data.id
        ? previousProfile.skills.map((skill) =>
            skill.id === data.id ? { ...skill, ...optimisticSkill } : skill
          )
        : [...previousProfile.skills, optimisticSkill];

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        skills: updatedSkills,
      });

      return { previousProfile };
    },
    onError: (_err, _data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: (result) => {
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile || !result?.skill) {
        toast.success(messages.success());
        return;
      }

      const cleanSkills =
        result.kind === 'create'
          ? previousProfile.skills.filter((skill) => !String(skill.id).startsWith('-1'))
          : previousProfile.skills;

      const nextSkills =
        result.kind === 'create'
          ? [...cleanSkills, result.skill]
          : cleanSkills.map((skill) =>
              skill.id === result.skill.id ? result.skill : skill
            );

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        skills: nextSkills,
      });
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useDeleteSkillMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileService.deleteSkill(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, {
          ...previousProfile,
          skills: previousProfile.skills.filter((skill) => skill.id !== id),
        });
      }
      return { previousProfile };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: () => {
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useSaveInterestMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InterestFormData) => {
      if (data.id) {
        await profileService.updateInterest(data.id, data);
        return { kind: 'update' as const, interest: { ...data, id: data.id } };
      }
      const created = await profileService.addInterest(data);
      return { kind: 'create' as const, interest: created };
    },
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile) return { previousProfile };

      const optimisticInterest: Interest = {
        id: data.id ?? Number(`-1${Date.now()}`),
        name: data.name,
      };

      const updatedInterests = data.id
        ? previousProfile.interests.map((interest) =>
            interest.id === data.id ? { ...interest, ...optimisticInterest } : interest
          )
        : [...previousProfile.interests, optimisticInterest];

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        interests: updatedInterests,
      });

      return { previousProfile };
    },
    onError: (_err, _data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: (result) => {
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (!previousProfile || !result?.interest) {
        toast.success(messages.success());
        return;
      }

      const cleanInterests =
        result.kind === 'create'
          ? previousProfile.interests.filter((interest) => !String(interest.id).startsWith('-1'))
          : previousProfile.interests;

      const nextInterests =
        result.kind === 'create'
          ? [...cleanInterests, result.interest]
          : cleanInterests.map((interest) =>
              interest.id === result.interest.id ? result.interest : interest
            );

      queryClient.setQueryData<Profile>(profileKeys.me, {
        ...previousProfile,
        interests: nextInterests,
      });
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

export const useDeleteInterestMutationWithOptimistic = (messages: ToastMessages) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => profileService.deleteInterest(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: profileKeys.me });
      const previousProfile = queryClient.getQueryData<Profile>(profileKeys.me);
      if (previousProfile) {
        queryClient.setQueryData<Profile>(profileKeys.me, {
          ...previousProfile,
          interests: previousProfile.interests.filter((interest) => interest.id !== id),
        });
      }
      return { previousProfile };
    },
    onError: (_err, _id, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileKeys.me, context.previousProfile);
      }
      toast.error(messages.error());
    },
    onSuccess: () => {
      toast.success(messages.success());
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
    },
  });
};

// Legacy hook-style exports (functions)
export const {
  createProfile,
  getMyProfile,
  updateProfile,
  getPublicProfile,
  uploadImage,
  deleteImage,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  updateSkill,
  deleteSkill,
  addInterest,
  updateInterest,
  deleteInterest,
  deleteAllProfileData,
} = profileService;

// Hooks
export const useMyProfileQuery = (enabled = true) =>
  useQueryWithToast({
    queryKey: profileKeys.me,
    queryFn: () => profileService.getMyProfile(),
    enabled,
  });

export const usePublicProfileQuery = (userId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: userId ? profileKeys.public(userId) : profileKeys.public('missing'),
    queryFn: () => profileService.getPublicProfile(userId as number),
    enabled: Boolean(userId) && enabled,
  });

export const useCreateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.createProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Profile created');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Profile updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUploadProfileImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Profile image updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteProfileImageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileService.deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Profile image deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteEducationMutation = (educationId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.deleteEducation(educationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Education removed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteExperienceMutation = (experienceId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.deleteExperience(experienceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Experience removed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteSkillMutation = (skillId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.deleteSkill(skillId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Skill removed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteInterestMutation = (interestId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => profileService.deleteInterest(interestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileKeys.me });
      toast.success('Interest removed');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};
