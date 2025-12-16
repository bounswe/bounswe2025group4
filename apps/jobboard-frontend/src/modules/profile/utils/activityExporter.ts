import type {
  ActivityResponse,
  ActivityType,
  AS2Activity,
  AS2OrderedCollection,
  AS2Actor,
  AS2Object,
} from '@shared/types/api.types';

const APP_BASE_URL = import.meta.env.VITE_APP_URL || 'https://bounswe-jobboard.pages.dev';

/**
 * Map backend activity type to W3C AS2 vocabulary
 * Spec reference: https://www.w3.org/TR/activitystreams-vocabulary/
 */
function mapActivityType(backendType: ActivityType): AS2Activity['type'] {
  const mapping: Record<ActivityType, AS2Activity['type']> = {
    REGISTER: 'Join',
    UPDATE_PROFILE: 'Update',
    CREATE_WORKPLACE: 'Create',
    CREATE_JOB: 'Create',
    APPLY_JOB: 'Offer',
    APPROVE_APPLICATION: 'Accept',
    REJECT_APPLICATION: 'Reject',
    CREATE_REVIEW: 'Create',
    REQUEST_MENTORSHIP: 'Offer',
    ACCEPT_MENTORSHIP: 'Accept',
    COMPLETE_MENTORSHIP: 'Update',
    CREATE_THREAD: 'Create',
    CREATE_COMMENT: 'Create',
    UPVOTE_THREAD: 'Like',
    DOWNVOTE_THREAD: 'Dislike',
    EDIT_THREAD: 'Update',
    DELETE_THREAD: 'Delete',
  };

  return mapping[backendType];
}

/**
 * Map entity type to AS2 object type
 */
function mapObjectType(entityType?: string, activityType?: ActivityType): string {
  if (!entityType) {
    // Infer from activity type
    if (activityType === 'REGISTER') return 'Application';
    if (activityType === 'UPDATE_PROFILE') return 'Profile';
    return 'Object';
  }

  const mapping: Record<string, AS2Object['type']> = {
    USER: 'Person',
    WORKPLACE: 'Organization',
    THREAD: 'Article',
    COMMENT: 'Note',
    REVIEW: 'Article',
    MENTORSHIP: 'Relationship',
  };

  return mapping[entityType?.toUpperCase() ?? ''] ?? 'Object';
}

/**
 * Build AS2-compliant actor object
 */
function buildAS2Actor(activity: ActivityResponse): AS2Actor {
  const { actor } = activity;

  return {
    type: 'Person',
    id: `${APP_BASE_URL}/users/${actor.id}`,
    name: actor.username,
  };
}

/**
 * Build AS2-compliant object
 */
function buildAS2Object(activity: ActivityResponse): AS2Object {
  const { entityId, entityType, type: activityType } = activity;

  const objectType = mapObjectType(entityType, activityType);

  // For REGISTER, the object is the application itself
  if (activityType === 'REGISTER') {
    return {
      type: 'Organization',
      id: `${APP_BASE_URL}`,
      name: 'Ethica Jobs',
    };
  }

  // For UPDATE_PROFILE, the object is the user's profile
  if (activityType === 'UPDATE_PROFILE') {
    return {
      type: 'Profile',
      id: `${APP_BASE_URL}/profile/${activity.actor.id}`,
      name: activity.actor.username,
    };
  }

  // For other activities, construct object from entity
  const objectId = entityId
    ? `${APP_BASE_URL}/${entityType?.toLowerCase() || 'objects'}/${entityId}`
    : `${APP_BASE_URL}/objects/unknown`;

  return {
    type: objectType,
    id: objectId,
  };
}

/**
 * Transform backend activity to AS2 format
 */
function transformToAS2Activity(activity: ActivityResponse): AS2Activity {
  return {
    type: mapActivityType(activity.type),
    id: `${APP_BASE_URL}/activities/${activity.id}`,
    actor: buildAS2Actor(activity),
    object: buildAS2Object(activity),
    summary: `${activity.actor.username} ${activity.type.replace('_', ' ').toLowerCase()}`,
    published: activity.createdAt,
  };
}


/**
 * Build W3C Activity Streams 2.0 compliant export
 *
 * Spec compliance:
 * - Uses @context for JSON-LD
 * - OrderedCollection for activity streams
 * - Standard AS2 vocabulary (Create, Join, Update, etc.)
 * - Proper actor-activity-object pattern
 * - ISO 8601 timestamps with 'published' field
 */
export function buildActivityExport(
  _userId: number,
  activities: ActivityResponse[]
): AS2OrderedCollection {
  const as2Activities = activities.map(transformToAS2Activity);

  return {
    '@context': 'https://www.w3.org/ns/activitystreams',
    type: 'OrderedCollection',
    totalItems: as2Activities.length,
    published: new Date().toISOString(),
    orderedItems: as2Activities,
  };
}

/**
 * Trigger JSON file download in browser
 */
export function downloadJson(data: object, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
