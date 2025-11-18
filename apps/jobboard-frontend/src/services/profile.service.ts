import { apiClient } from '@/lib/api-client';
import type { Profile } from '@/types/profile.types';

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
  getPublicProfile: async (userId: number): Promise<Profile> => {
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