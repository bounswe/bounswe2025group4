import { api } from '@shared/lib/api-client';
import { activityKeys } from '@shared/lib/query-keys';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  ActivityResponse,
  PaginatedActivitiesResponse,
  ActivityQueryParams,
} from '@shared/types/api.types';

/**
 * Fetch user activities with pagination
 * GET /api/activities/user/{userId}
 */
async function fetchUserActivities(
  userId: number,
  params?: ActivityQueryParams
): Promise<PaginatedActivitiesResponse> {
  const queryParams = {
    page: params?.page ?? 0,
    size: params?.size ?? 20,
    sort: params?.sort ?? 'createdAt,desc',
  };

  const response = await api.get<PaginatedActivitiesResponse>(
    `/activities/user/${userId}`,
    { params: queryParams }
  );
  return response.data;
}

/**
 * Fetch all user activities across all pages
 * Used for data export to ensure complete history
 *
 * IMPORTANT: This bypasses React Query cache and fetches directly
 * to ensure we get complete data for GDPR export
 */
export async function fetchAllUserActivities(
  userId: number
): Promise<ActivityResponse[]> {
  const pageSize = 100; // Larger page size for efficiency
  let page = 0;
  const allActivities: ActivityResponse[] = [];
  let last = false;

  while (!last) {
    const response = await api.get<PaginatedActivitiesResponse>(
      `/activities/user/${userId}`,
      {
        params: {
          page,
          size: pageSize,
          sort: 'createdAt,desc',
        },
      }
    );

    allActivities.push(...response.data.content);
    last = response.data.last;
    page++;
  }

  return allActivities;
}

// Legacy export
export { fetchUserActivities as getUserActivities };

// React Query Hook
export const useUserActivitiesQuery = (
  userId?: number,
  params?: ActivityQueryParams,
  enabled = true
) =>
  useQueryWithToast({
    queryKey: userId
      ? activityKeys.user(userId, params)
      : activityKeys.user('missing'),
    queryFn: () => fetchUserActivities(userId as number, params),
    enabled: Boolean(userId) && enabled,
  });
