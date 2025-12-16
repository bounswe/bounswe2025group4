import type { ActivityResponse, ActivityType } from '@shared/types/api.types';
import type { ActivityDisplay } from '@shared/types/profile.types';
import { formatDistanceToNow } from 'date-fns';
import { enUS, tr, ar } from 'date-fns/locale';
import i18n from '@shared/lib/i18n';

/**
 * Get date-fns locale based on current i18n language
 */
function getDateLocale() {
  const currentLang = i18n.language;

  switch (currentLang) {
    case 'tr':
      return tr;
    case 'ar':
      return ar;
    case 'en':
    default:
      return enUS;
  }
}

export type ActivityEntityData = {
  title?: string;
  workplace?: { companyName?: string };
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
 * Mapping from activity type to translation key
 */
const ACTIVITY_TYPE_KEYS: Record<ActivityType, string> = {
  REGISTER: 'profile.activity.types.register',
  UPDATE_PROFILE: 'profile.activity.types.updateProfile',
  CREATE_WORKPLACE: 'profile.activity.types.createWorkplace',
  CREATE_JOB: 'profile.activity.types.createJob',
  APPLY_JOB: 'profile.activity.types.applyJob',
  APPROVE_APPLICATION: 'profile.activity.types.approveApplication',
  REJECT_APPLICATION: 'profile.activity.types.rejectApplication',
  CREATE_REVIEW: 'profile.activity.types.createReview',
  REQUEST_MENTORSHIP: 'profile.activity.types.requestMentorship',
  ACCEPT_MENTORSHIP: 'profile.activity.types.acceptMentorship',
  COMPLETE_MENTORSHIP: 'profile.activity.types.completeMentorship',
  CREATE_THREAD: 'profile.activity.types.createThread',
  CREATE_COMMENT: 'profile.activity.types.createComment',
  UPVOTE_THREAD: 'profile.activity.types.upvoteThread',
  DOWNVOTE_THREAD: 'profile.activity.types.downvoteThread',
  EDIT_THREAD: 'profile.activity.types.editThread',
  DELETE_THREAD: 'profile.activity.types.deleteThread',
};

/**
 * Generate simple description from activity type and actor
 * Used as fallback or when entity details aren't needed
 */
function getSimpleDescription(activity: ActivityResponse): string {
  const { type } = activity;
  const translationKey = ACTIVITY_TYPE_KEYS[type];

  if (translationKey) {
    return i18n.t(translationKey);
  }

  return 'Unknown activity';
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

  const formatTimestamp = (timestamp: string): string => {
    try {
      // Properly handle UTC timezone - if timestamp doesn't have timezone info, treat it as UTC
      let date: Date;
      
      // If timestamp already has timezone info (Z or +/- offset), parse directly
      if (timestamp.includes('Z') || timestamp.match(/[+-]\d{2}:\d{2}$/)) {
        date = new Date(timestamp);
      } else {
        // No timezone info - assume it's UTC and append 'Z'
        // This ensures backend UTC timestamps are properly converted to local time
        date = new Date(timestamp + 'Z');
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        // Fallback: try parsing without 'Z'
        date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          return ''; // Return empty if still invalid
        }
      }

      // Show relative time for all activities
      return formatDistanceToNow(date, {
        addSuffix: true,
        locale: getDateLocale(),
      });
    } catch (_err: unknown) {
      return '';
    }
  };

  return {
    id: activity.id,
    type: activity.type,
    icon: ACTIVITY_ICONS[activity.type] || 'Circle',
    text: getSimpleDescription(activity),
    date: formatTimestamp(activity.createdAt),
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
      richText = i18n.t('profile.activity.enriched.createJob', {
        title: entityData.title || 'Unknown',
      });
      break;
    case 'APPLY_JOB':
      {
        const workplaceName = entityData.workplace?.companyName;
        richText = i18n.t('profile.activity.enriched.applyJob', {
          title: entityData.title || 'a job',
          workplace: workplaceName
            ? i18n.t('profile.activity.enriched.applyJobWithWorkplace', {
                workplace: workplaceName,
              })
            : '',
        });
      }
      break;
    case 'APPROVE_APPLICATION':
      richText = i18n.t('profile.activity.enriched.approveApplication', {
        title: entityData.title || 'a job',
      });
      break;
    case 'REJECT_APPLICATION':
      richText = i18n.t('profile.activity.enriched.rejectApplication', {
        title: entityData.title || 'a job',
      });
      break;
    case 'CREATE_WORKPLACE':
      richText = i18n.t('profile.activity.enriched.createWorkplace', {
        name: entityData.name || 'Unknown',
      });
      break;
    case 'CREATE_REVIEW':
      richText = i18n.t('profile.activity.enriched.createReview', {
        name: entityData.name || 'a workplace',
      });
      break;
    case 'CREATE_THREAD':
      richText = i18n.t('profile.activity.enriched.createThread', {
        title: entityData.title || 'Untitled',
      });
      break;
    case 'CREATE_COMMENT':
      richText = i18n.t('profile.activity.enriched.createComment', {
        title: entityData.title || 'a thread',
      });
      break;
    case 'REQUEST_MENTORSHIP':
      richText = i18n.t('profile.activity.enriched.requestMentorship', {
        username: entityData.username || 'a mentor',
      });
      break;
    case 'ACCEPT_MENTORSHIP':
      richText = i18n.t('profile.activity.enriched.acceptMentorship');
      break;
  }

  return { ...activity, text: richText };
}
