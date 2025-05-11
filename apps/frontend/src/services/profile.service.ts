import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import {
  Experience,
  Badge,
  Education,
  Profile,
  ProfileResponse,
  FullProfileResponse,
} from '../types/user';

// Query keys for caching
export const USER_KEYS = {
  all: ['users'] as const,
  me: ['me'] as const,
  detail: (userId: string) => [...USER_KEYS.all, userId] as const,
  workHistory: (userId: string) =>
    [...USER_KEYS.detail(userId), 'work-history'] as const,
  education: (userId: string) =>
    [...USER_KEYS.detail(userId), 'education'] as const,
  badges: (userId: string) => [...USER_KEYS.detail(userId), 'badges'] as const,
  skills: (userId: string) => [...USER_KEYS.detail(userId), 'skills'] as const,
  interests: (userId: string) =>
    [...USER_KEYS.detail(userId), 'interests'] as const,
  forumActivity: (userId: string) =>
    [...USER_KEYS.detail(userId), 'forum-activity'] as const,
};

class ProfileService {
  /* Base Profile API */

  // Get current user profile (me)
  async getMe(): Promise<FullProfileResponse> {
    const response = await apiClient.get<FullProfileResponse>('/api/me');
    return response.data;
  }

  // Get user profile by ID
  async getProfileById(userId: number): Promise<FullProfileResponse> {
    const response = await apiClient.get<FullProfileResponse>(
      `/api/profile/${userId}`
    );
    return response.data;
  }

  // Create user profile
  async createProfile(profileData: Partial<Profile>): Promise<ProfileResponse> {
    const response = await apiClient.post<ProfileResponse>(
      '/api/profile',
      profileData
    );
    return response.data;
  }

  // Update user profile
  async updateProfile(
    userId: number,
    profileData: Partial<Profile>
  ): Promise<ProfileResponse> {
    const response = await apiClient.patch<ProfileResponse>(
      `/api/profile/${userId}`,
      profileData
    );
    return response.data;
  }

  async updateProfileSkills(
    userId: number,
    skills: string[]
  ): Promise<string[]> {
    const response = await apiClient.patch<string[]>(
      `/api/profile/${userId}/skills`,
      { skills }
    );
    return response.data;
  }

  async updateProfileInterests(
    userId: number,
    interests: string[]
  ): Promise<string[]> {
    const response = await apiClient.patch<string[]>(
      `/api/profile/${userId}/interests`,
      { interests }
    );
    return response.data;
  }

  /* Experience API */

  async createExperience(
    userId: number,
    experience: Omit<Experience, 'id'>
  ): Promise<Experience> {
    const response = await apiClient.post<Experience>(
      `/api/profile/${userId}/experience`,
      experience
    );
    return response.data;
  }

  async updateExperience(
    userId: number,
    experienceId: number,
    experience: Experience
  ): Promise<Experience> {
    const response = await apiClient.put<Experience>(
      `/api/profile/${userId}/experience/${experienceId}`,
      experience
    );
    return response.data;
  }

  async deleteExperience(userId: number, experienceId: number): Promise<void> {
    await apiClient.delete(`/api/profile/${userId}/experience/${experienceId}`);
  }

  /* Education API */

  async createEducation(
    userId: number,
    education: Omit<Education, 'id'>
  ): Promise<Education> {
    const response = await apiClient.post<Education>(
      `/api/profile/${userId}/education`,
      education
    );
    return response.data;
  }

  async updateEducation(
    userId: number,
    educationId: number,
    education: Education
  ): Promise<Education> {
    const response = await apiClient.put<Education>(
      `/api/profile/${userId}/education/${educationId}`,
      education
    );
    return response.data;
  }

  async deleteEducation(userId: number, educationId: number): Promise<void> {
    await apiClient.delete(`/api/profile/${userId}/education/${educationId}`);
  }

  /* Badge API */

  async createBadge(userId: number, badge: Omit<Badge, 'id'>): Promise<Badge> {
    const response = await apiClient.post<Badge>(
      `/api/profile/${userId}/badges`,
      badge
    );
    return response.data;
  }

  async updateBadge(
    userId: number,
    badgeId: number,
    badge: Badge
  ): Promise<Badge> {
    const response = await apiClient.put<Badge>(
      `/api/profile/${userId}/badges/${badgeId}`,
      badge
    );
    return response.data;
  }

  async deleteBadge(userId: number, badgeId: number): Promise<void> {
    await apiClient.delete(`/api/profile/${userId}/badges/${badgeId}`);
  }

  /* Profile Picture API */

  // Upload profile picture
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ profilePicture: string }>(
      `/api/profile/${userId}/profile-picture`,
      formData
    );

    return response.data.profilePicture;
  }

  // Delete profile picture
  async deleteProfilePicture(userId: string): Promise<void> {
    await apiClient.delete(`/api/profile/${userId}/profile-picture`);
  }
}

export const userService = new ProfileService();

// React Query Hooks
export const useMe = () => {
  return useQuery({
    queryKey: USER_KEYS.me,
    queryFn: () => userService.getMe(),
  });
};

export const useUserProfileById = (userId: number) => {
  return useQuery({
    queryKey: USER_KEYS.detail(userId.toString()),
    queryFn: () => userService.getProfileById(userId),
    enabled: !!userId,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<Profile>) =>
      userService.createProfile(userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(data.id.toString()),
      });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: number;
      userData: Partial<Profile>;
    }) => userService.updateProfile(userId, userData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(data.id.toString()),
      });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};

export const useWorkHistory = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.workHistory(userId),
    queryFn: () => userService.getProfileById(parseInt(userId)),
    enabled: !!userId,
  });
};

export const useAddWorkExperience = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workExp: Omit<Experience, 'id'>) =>
      userService.createExperience(parseInt(userId), workExp),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.workHistory(userId),
      });
    },
  });
};

export const useUpdateWorkExperience = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workExp: Experience) =>
      userService.updateExperience(parseInt(userId), workExp.id, workExp),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.workHistory(userId),
      });
    },
  });
};

export const useDeleteWorkExperience = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workExpId: number) =>
      userService.deleteExperience(parseInt(userId), workExpId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.workHistory(userId),
      });
    },
  });
};

export const useEducation = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.education(userId),
    queryFn: () => userService.getProfileById(parseInt(userId)),
    enabled: !!userId,
  });
};

export const useAddEducation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (education: Omit<Education, 'id'>) =>
      userService.createEducation(parseInt(userId), education),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.education(userId),
      });
    },
  });
};

export const useUpdateEducation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (education: Education) =>
      userService.updateEducation(parseInt(userId), education.id, education),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.education(userId),
      });
    },
  });
};

export const useDeleteEducation = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (educationId: number) =>
      userService.deleteEducation(parseInt(userId), educationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.education(userId),
      });
    },
  });
};

export const useSkills = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.skills(userId),
    queryFn: () => userService.getProfileById(parseInt(userId)),
    enabled: !!userId,
  });
};

export const useUpdateSkills = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skills: string[]) =>
      userService.updateProfileSkills(parseInt(userId), skills),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.skills(userId),
      });
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId),
      });
    },
  });
};

export const useInterests = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.interests(userId),
    queryFn: () => userService.getProfileById(parseInt(userId)),
    enabled: !!userId,
  });
};

export const useUpdateInterests = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interests: string[]) =>
      userService.updateProfileInterests(parseInt(userId), interests),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.interests(userId),
      });
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId),
      });
    },
  });
};

export const useUserBadges = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.badges(userId),
    queryFn: () => userService.getProfileById(parseInt(userId)),
    enabled: !!userId,
  });
};

export const useAddBadge = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (badge: Omit<Badge, 'id'>) =>
      userService.createBadge(parseInt(userId), badge),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.badges(userId),
      });
    },
  });
};

export const useDeleteBadge = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (badgeId: number) =>
      userService.deleteBadge(parseInt(userId), badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.badges(userId),
      });
    },
  });
};

export const useForumActivityCount = (userId: string) => {
  return useQuery({
    queryKey: USER_KEYS.forumActivity(userId),
    queryFn: () => userService.getProfileById(parseInt(userId)),
    enabled: !!userId,
  });
};

export const useProfilePictureUpload = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(userId) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};

export const useDeleteProfilePicture = (userId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteProfilePicture(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(userId) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};

export const useAvatarUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      // Upload directly using the profile picture endpoint since we don't have S3 presigned URL methods
      return userService.uploadProfilePicture(userId, file);
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: USER_KEYS.detail(userId) });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};
