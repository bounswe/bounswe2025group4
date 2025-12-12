import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import { apiClient } from '@shared/lib/api-client';
import { badgeKeys } from '@shared/lib/query-keys';
import type { BadgeCode } from '@modules/profile/constants/badges';

export interface BadgeType {
  code: BadgeCode;
  name: string;
  description: string;
  criteria: string;
  threshold: number;
}

export interface UserBadgeResponse {
  earnedBadges: BadgeCode[];
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
   * Get user's earned badges
   * GET /api/badges/user/{userId}
   */
  getUserBadges: async (userId?: number): Promise<UserBadgeResponse> => {
    const endpoint = userId ? `/badges/user/${userId}` : '/badges/user/me';
    const response = await apiClient.get(endpoint);
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
 * Hook to fetch user's earned badges
 */
export const useUserBadgesQuery = (userId?: number) =>
  useQueryWithToast({
    queryKey: userId ? badgeKeys.user(userId) : badgeKeys.myBadges,
    queryFn: () => badgeService.getUserBadges(userId),
  });
