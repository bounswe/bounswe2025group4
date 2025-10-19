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
    const response = await apiClient.post('/api/profile', data);
    return response.data;
  },

  /**
   * Get current user's profile
   * GET /api/profile
   */
  getMyProfile: async (): Promise<Profile> => {
    const response = await apiClient.get('/api/profile');
    return response.data;
  },

  /**
   * Update profile
   * PUT /api/profile
   */
  updateProfile: async (data: {
    firstName?: string;
    lastName?: string;
    bio?: string;
  }): Promise<Profile> => {
    const response = await apiClient.put('/api/profile', data);
    return response.data;
  },

  /**
   * Get public profile by user ID
   * GET /api/profile/{userId}
   */
  getPublicProfile: async (userId: number): Promise<Profile> => {
    const response = await apiClient.get(`/api/profile/${userId}`);
    return response.data;
  },

  // ==================== IMAGE ====================

  /**
   * Upload profile image
   * POST /api/profile/image
   */
  uploadImage: async (file: File): Promise<{ imageUrl: string; updatedAt: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/api/profile/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Delete profile image
   * DELETE /api/profile/image
   */
  deleteImage: async (): Promise<void> => {
    await apiClient.delete('/api/profile/image');
  },

  // ==================== EDUCATION ====================

  /**
   * Add education
   * POST /api/profile/education
   */
  addEducation: async (data: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/api/profile/education', data);
    return response.data;
  },

  /**
   * Update education
   * PUT /api/profile/education/{educationId}
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
    const response = await apiClient.put(`/api/profile/education/${educationId}`, data);
    return response.data;
  },

  /**
   * Delete education
   * DELETE /api/profile/education/{educationId}
   */
  deleteEducation: async (educationId: number): Promise<void> => {
    await apiClient.delete(`/api/profile/education/${educationId}`);
  },

  // ==================== EXPERIENCE ====================

  /**
   * Add experience
   * POST /api/profile/experience
   */
  addExperience: async (data: {
    company: string;
    position: string;
    description?: string;
    startDate: string;
    endDate?: string;
  }) => {
    const response = await apiClient.post('/api/profile/experience', data);
    return response.data;
  },

  /**
   * Update experience
   * PUT /api/profile/experience/{experienceId}
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
    const response = await apiClient.put(`/api/profile/experience/${experienceId}`, data);
    return response.data;
  },

  /**
   * Delete experience
   * DELETE /api/profile/experience/{experienceId}
   */
  deleteExperience: async (experienceId: number): Promise<void> => {
    await apiClient.delete(`/api/profile/experience/${experienceId}`);
  },

  // ==================== SKILL ====================

  /**
   * Add skill
   * POST /api/profile/skill
   */
  addSkill: async (data: { name: string; level?: string }) => {
    const response = await apiClient.post('/api/profile/skill', data);
    return response.data;
  },

  /**
   * Update skill
   * PUT /api/profile/skill/{skillId}
   */
  updateSkill: async (
    skillId: number,
    data: { name?: string; level?: string }
  ) => {
    const response = await apiClient.put(`/api/profile/skill/${skillId}`, data);
    return response.data;
  },

  /**
   * Delete skill
   * DELETE /api/profile/skill/{skillId}
   */
  deleteSkill: async (skillId: number): Promise<void> => {
    await apiClient.delete(`/api/profile/skill/${skillId}`);
  },

  // ==================== INTEREST ====================

  /**
   * Add interest
   * POST /api/profile/interest
   */
  addInterest: async (data: { name: string }) => {
    const response = await apiClient.post('/api/profile/interest', data);
    return response.data;
  },

  /**
   * Update interest
   * PUT /api/profile/interest/{interestId}
   */
  updateInterest: async (interestId: number, data: { name: string }) => {
    const response = await apiClient.put(`/api/profile/interest/${interestId}`, data);
    return response.data;
  },

  /**
   * Delete interest
   * DELETE /api/profile/interest/{interestId}
   */
  deleteInterest: async (interestId: number): Promise<void> => {
    await apiClient.delete(`/api/profile/interest/${interestId}`);
  },
};