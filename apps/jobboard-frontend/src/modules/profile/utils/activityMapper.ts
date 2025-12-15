import type { ActivityResponse, ActivityType } from '@shared/types/api.types';
import type { ActivityDisplay } from '@shared/types/profile.types';
import { formatDistanceToNow } from 'date-fns';

export type ActivityEntityData = {
  title?: string;
  workplace?: { name?: string };
  name?: string;
  username?: string;
};

/**
 * Icon mapping for each activity type (Lucide icon names)
 */
const ACTIVITY_ICONS: Record<ActivityType, string> = {
  REGISTER: 'UserPlus',
  UPDATE_PROFILE: 'User',
  CREATE_WORKPLACE: 'Building2',
  CREATE_JOB: 'Briefcase',
  APPLY_JOB: 'FileText',
  APPROVE_APPLICATION: 'CheckCircle',
  REJECT_APPLICATION: 'XCircle',
  CREATE_REVIEW: 'Star',
  REQUEST_MENTORSHIP: 'MessageCircle',
  ACCEPT_MENTORSHIP: 'UserCheck',
  COMPLETE_MENTORSHIP: 'Award',
  CREATE_THREAD: 'MessageSquare',
  CREATE_COMMENT: 'MessageCircle',
  UPVOTE_THREAD: 'ThumbsUp',
  DOWNVOTE_THREAD: 'ThumbsDown',
  EDIT_THREAD: 'Pencil',
  DELETE_THREAD: 'Trash2',
};

/**
 * Generate simple description from activity type and actor
 * Used as fallback or when entity details aren't needed
 */
function getSimpleDescription(activity: ActivityResponse): string {
  const { type } = activity;

  switch (type) {
    case 'REGISTER':
      return 'Joined the platform';
    case 'UPDATE_PROFILE':
      return 'Updated profile';
    case 'CREATE_WORKPLACE':
      return 'Created a workplace';
    case 'CREATE_JOB':
      return 'Posted a job';
    case 'APPLY_JOB':
      return 'Applied to a job';
    case 'APPROVE_APPLICATION':
      return 'Approved a job application';
    case 'REJECT_APPLICATION':
      return 'Rejected a job application';
    case 'CREATE_REVIEW':
      return 'Wrote a workplace review';
    case 'REQUEST_MENTORSHIP':
      return 'Requested mentorship';
    case 'ACCEPT_MENTORSHIP':
      return 'Accepted a mentorship request';
    case 'COMPLETE_MENTORSHIP':
      return 'Completed a mentorship session';
    case 'CREATE_THREAD':
      return 'Posted in the forum';
    case 'CREATE_COMMENT':
      return 'Commented on a forum post';
    case 'UPVOTE_THREAD':
      return 'Upvoted a forum post';
    case 'DOWNVOTE_THREAD':
      return 'Downvoted a forum post';
    case 'EDIT_THREAD':
      return 'Edited a forum post';
    case 'DELETE_THREAD':
      return 'Deleted a forum post';
    default:
      return 'Unknown activity';
  }
}

/**
 * Generate navigation URL for activity based on type and entityId
 */
function getNavigationUrl(activity: ActivityResponse): string | undefined {
  const { type, entityId } = activity;

  if (!entityId) return undefined;

  switch (type) {
    case 'CREATE_WORKPLACE':
    case 'CREATE_REVIEW':
      return `/workplace/${entityId}`;

    case 'CREATE_JOB':
    case 'APPLY_JOB':
    case 'APPROVE_APPLICATION':
    case 'REJECT_APPLICATION':
      return `/jobs/${entityId}`;

    case 'REQUEST_MENTORSHIP':
    case 'ACCEPT_MENTORSHIP':
    case 'COMPLETE_MENTORSHIP':
      return `/mentorship/${entityId}`;

    case 'CREATE_THREAD':
    case 'CREATE_COMMENT':
    case 'UPVOTE_THREAD':
    case 'DOWNVOTE_THREAD':
    case 'EDIT_THREAD':
      return `/forum/${entityId}`;

    case 'UPDATE_PROFILE':
      return `/profile/${activity.actor.id}`;

    case 'REGISTER':
    case 'DELETE_THREAD':
    default:
      return undefined;
  }
}

/**
 * Map API activity to display format
 * This version uses simple descriptions. Rich descriptions will be added
 * by enriching activities with entity data in a separate step.
 */
export function mapActivityToDisplay(activity: ActivityResponse): ActivityDisplay {
  const navigationUrl = getNavigationUrl(activity);

  return {
    id: activity.id,
    type: activity.type,
    icon: ACTIVITY_ICONS[activity.type] || 'Circle',
    text: getSimpleDescription(activity),
    date: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }),
    clickable: Boolean(navigationUrl),
    navigationUrl,
    rawData: activity,
  };
}

/**
 * Map array of activities to display format
 */
export function mapActivitiesToDisplay(
  activities: ActivityResponse[]
): ActivityDisplay[] {
  return activities.map(mapActivityToDisplay);
}

/**
 * Enrich activity descriptions with entity details
 * This function will be called after fetching entity data to create rich descriptions
 */
export function enrichActivityDescription(
  activity: ActivityDisplay,
  entityData?: ActivityEntityData
): ActivityDisplay {
  if (!entityData) return activity;

  let richText = activity.text;

  switch (activity.type) {
    case 'CREATE_JOB':
      richText = `Posted a job: ${entityData.title || 'Unknown'}`;
      break;
    case 'APPLY_JOB':
      richText = `Applied to ${entityData.title || 'a job'}${entityData.workplace?.name ? ` at ${entityData.workplace.name}` : ''}`;
      break;
    case 'APPROVE_APPLICATION':
      richText = `Approved an application for ${entityData.title || 'a job'}`;
      break;
    case 'REJECT_APPLICATION':
      richText = `Rejected an application for ${entityData.title || 'a job'}`;
      break;
    case 'CREATE_WORKPLACE':
      richText = `Created workplace: ${entityData.name || 'Unknown'}`;
      break;
    case 'CREATE_REVIEW':
      richText = `Reviewed ${entityData.name || 'a workplace'}`;
      break;
    case 'CREATE_THREAD':
      richText = `Posted in forum: "${entityData.title || 'Untitled'}"`;
      break;
    case 'CREATE_COMMENT':
      richText = `Commented on "${entityData.title || 'a thread'}"`;
      break;
    case 'REQUEST_MENTORSHIP':
      richText = `Requested mentorship from ${entityData.username || 'a mentor'}`;
      break;
    case 'ACCEPT_MENTORSHIP':
      richText = `Accepted mentorship request`;
      break;
  }

  return { ...activity, text: richText };
}
