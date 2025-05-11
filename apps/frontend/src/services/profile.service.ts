import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import {
  Experience,
  Badge,
  Education,
  Profile,
  ProfileResponse,
  FullProfileResponse,
} from '../types/profile';

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
    const response = await apiClient.get<FullProfileResponse>('/me');
    return response.data;
  }

  // Get user profile by ID
  async getProfileById(userId: number): Promise<FullProfileResponse> {
    const response = await apiClient.get<FullProfileResponse>(
      `/profile/${userId}`
    );
    return response.data;
  }

  // Create user profile
  async createProfile(profileData: Partial<Profile>): Promise<ProfileResponse> {
    const response = await apiClient.post<ProfileResponse>(
      '/profile',
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
      `/profile/${userId}`,
      profileData
    );
    return response.data;
  }

  async updateProfileSkills(
    userId: number,
    skills: string[]
  ): Promise<string[]> {
    const response = await apiClient.patch<string[]>(
      `/profile/${userId}/skills`,
      { skills }
    );
    return response.data;
  }

  async updateProfileInterests(
    userId: number,
    interests: string[]
  ): Promise<string[]> {
    const response = await apiClient.patch<string[]>(
      `/profile/${userId}/interests`,
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
      `/profile/${userId}/experience`,
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
      `/profile/${userId}/experience/${experienceId}`,
      experience
    );
    return response.data;
  }

  async deleteExperience(userId: number, experienceId: number): Promise<void> {
    await apiClient.delete(`/profile/${userId}/experience/${experienceId}`);
  }

  /* Education API */

  async createEducation(
    userId: number,
    education: Omit<Education, 'id'>
  ): Promise<Education> {
    const response = await apiClient.post<Education>(
      `/profile/${userId}/education`,
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
      `/profile/${userId}/education/${educationId}`,
      education
    );
    return response.data;
  }

  async deleteEducation(userId: number, educationId: number): Promise<void> {
    await apiClient.delete(`/profile/${userId}/education/${educationId}`);
  }

  /* Badge API */

  async createBadge(userId: number, badge: Omit<Badge, 'id'>): Promise<Badge> {
    const response = await apiClient.post<Badge>(
      `/profile/${userId}/badges`,
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
      `/profile/${userId}/badges/${badgeId}`,
      badge
    );
    return response.data;
  }

  async deleteBadge(userId: number, badgeId: number): Promise<void> {
    await apiClient.delete(`/profile/${userId}/badges/${badgeId}`);
  }

  /* Profile Picture API */

  // Upload profile picture
  async uploadProfilePicture(userId: number, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<{ profilePicture: string }>(
      `/profile/${userId}/profile-picture`,
      formData
    );

    return response.data.profilePicture;
  }

  // Delete profile picture
  async deleteProfilePicture(userId: number): Promise<void> {
    await apiClient.delete(`/profile/${userId}/profile-picture`);
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

export const useUpdateUserProfile = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: Partial<Profile>) =>
      userService.updateProfile(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};

export const useSkills = (userId: number) => {
  return useQuery({
    queryKey: USER_KEYS.skills(userId.toString()),
    queryFn: () => userService.getProfileById(userId),
    enabled: !!userId,
  });
};

export const useUpdateSkills = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (skills: string[]) =>
      userService.updateProfileSkills(userId, skills),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.skills(userId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId.toString()),
      });
    },
  });
};

export const useInterests = (userId: number) => {
  return useQuery({
    queryKey: USER_KEYS.interests(userId.toString()),
    queryFn: () => userService.getProfileById(userId),
    enabled: !!userId,
  });
};

export const useUpdateInterests = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interests: string[]) =>
      userService.updateProfileInterests(userId, interests),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.interests(userId.toString()),
      });
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId.toString()),
      });
    },
  });
};

export const useWorkExperience = (userId: number) => {
  return useQuery({
    queryKey: USER_KEYS.workHistory(userId.toString()),
    queryFn: () => userService.getProfileById(userId),
    enabled: !!userId,
  });
};

export const useAddWorkExperience = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workExp: Omit<Experience, 'id'>) =>
      userService.createExperience(userId, workExp),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.workHistory(userId.toString()),
      });
    },
  });
};

export const useUpdateWorkExperience = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workExp: Experience) =>
      userService.updateExperience(userId, workExp.id, workExp),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.workHistory(userId.toString()),
      });
    },
  });
};

export const useDeleteWorkExperience = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workExpId: number) =>
      userService.deleteExperience(userId, workExpId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.workHistory(userId.toString()),
      });
    },
  });
};

export const useEducation = (userId: number) => {
  return useQuery({
    queryKey: USER_KEYS.education(userId.toString()),
    queryFn: () => userService.getProfileById(userId),
    enabled: !!userId,
  });
};

export const useAddEducation = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (education: Omit<Education, 'id'>) =>
      userService.createEducation(userId, education),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.education(userId.toString()),
      });
    },
  });
};

export const useUpdateEducation = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (education: Education) =>
      userService.updateEducation(userId, education.id, education),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.education(userId.toString()),
      });
    },
  });
};

export const useDeleteEducation = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (educationId: number) =>
      userService.deleteEducation(userId, educationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.education(userId.toString()),
      });
    },
  });
};

export const useUserBadges = (userId: number) => {
  return useQuery({
    queryKey: USER_KEYS.badges(userId.toString()),
    queryFn: () => userService.getProfileById(userId),
    enabled: !!userId,
  });
};

export const useAddBadge = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (badge: Omit<Badge, 'id'>) =>
      userService.createBadge(userId, badge),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.badges(userId.toString()),
      });
    },
  });
};

export const useDeleteBadge = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (badgeId: number) => userService.deleteBadge(userId, badgeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.badges(userId.toString()),
      });
    },
  });
};

export const useProfilePictureUpload = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userService.uploadProfilePicture(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};

export const useDeleteProfilePicture = (userId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userService.deleteProfilePicture(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: USER_KEYS.detail(userId.toString()),
      });
      queryClient.invalidateQueries({ queryKey: USER_KEYS.me });
    },
  });
};
