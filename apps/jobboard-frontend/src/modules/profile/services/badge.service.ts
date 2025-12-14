import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import { apiClient } from '@shared/lib/api-client';
import { badgeKeys } from '@shared/lib/query-keys';
import type { BadgeCode } from '@modules/profile/constants/badges';
import type { Badge } from '@shared/types/profile.types';

export interface BadgeType {
  type: BadgeCode;
  name: string;
  description: string;
  criteria: string;
  threshold: number;
}

/**
 * Badge API Service
 * Handles all badge-related API calls
 */
export const badgeService = {
  /**
   * Get all available badge types
   * GET /api/badges/types
   */
  getBadgeTypes: async (): Promise<BadgeType[]> => {
    const response = await apiClient.get('/badges/types');
    return response.data;
  },

  /**
   * Get current user's earned badges
   * GET /api/badges/my
   */
  getMyBadges: async (): Promise<Badge[]> => {
    const response = await apiClient.get('/badges/my');
    return response.data;
  },

  /**
   * Get a specific user's earned badges
   * GET /api/badges/user/{userId}
   */
  getUserBadges: async (userId: number): Promise<Badge[]> => {
    const response = await apiClient.get(`/badges/user/${userId}`);
    return response.data;
  },
};

/**
 * Hook to fetch all badge types
 */
export const useBadgeTypesQuery = () =>
  useQueryWithToast({
    queryKey: badgeKeys.types,
    queryFn: () => badgeService.getBadgeTypes(),
    staleTime: 1000 * 60 * 60, // 1 hour - badge types don't change often
  });

/**
 * Hook to fetch current user's earned badges
 */
export const useMyBadgesQuery = (enabled = true) =>
  useQueryWithToast({
    queryKey: badgeKeys.myBadges,
    queryFn: () => badgeService.getMyBadges(),
    enabled,
  });

/**
 * Hook to fetch a specific user's earned badges
 */
export const useUserBadgesQuery = (userId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: userId ? badgeKeys.user(userId) : [...badgeKeys.all, 'user', 'missing'],
    queryFn: () => badgeService.getUserBadges(userId as number),
    enabled: Boolean(userId) && enabled,
  });
