import { api } from '@shared/lib/api-client';
import type { ActivityDisplay } from '@shared/types/profile.types';
import { enrichActivityDescription, type ActivityEntityData } from './activityMapper';

/**
 * Fetch entity data for an activity
 */
async function fetchEntityData(activity: ActivityDisplay): Promise<ActivityEntityData | undefined> {
  const { type, rawData } = activity;
  const entityId = rawData.entityId;

  if (!entityId) return undefined;

  try {
    let response;

    switch (type) {
      case 'CREATE_JOB':
      case 'APPLY_JOB':
      case 'APPROVE_APPLICATION':
      case 'REJECT_APPLICATION':
        response = await api.get<ActivityEntityData>(`/jobs/${entityId}`);
        return response.data;

      case 'CREATE_WORKPLACE':
      case 'CREATE_REVIEW':
        response = await api.get<ActivityEntityData>(`/workplaces/${entityId}`);
        return response.data;

      case 'CREATE_THREAD':
      case 'CREATE_COMMENT':
      case 'UPVOTE_THREAD':
      case 'DOWNVOTE_THREAD':
      case 'EDIT_THREAD':
        response = await api.get<ActivityEntityData>(`/forum/posts/${entityId}`);
        return response.data;

      case 'REQUEST_MENTORSHIP':
      case 'ACCEPT_MENTORSHIP':
      case 'COMPLETE_MENTORSHIP':
        response = await api.get<ActivityEntityData>(`/mentorship/${entityId}`);
        return response.data;

      default:
        return undefined;
    }
  } catch (error) {
    console.warn(`Failed to fetch entity data for activity ${activity.id}:`, error);
    return undefined;
  }
}

/**
 * Enrich multiple activities with entity data
 * Fetches entity details in parallel and updates descriptions
 */
export async function enrichActivities(
  activities: ActivityDisplay[]
): Promise<ActivityDisplay[]> {
  const enrichmentPromises = activities.map(async (activity) => {
    const entityData = await fetchEntityData(activity);
    return enrichActivityDescription(activity, entityData);
  });

  return Promise.all(enrichmentPromises);
}
