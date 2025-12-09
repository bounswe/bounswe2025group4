export type NotificationType =
  | 'NEW_MESSAGE'
  | 'MENTORSHIP_REQUEST'
  | 'MENTORSHIP_APPROVED'
  | 'MENTORSHIP_REJECTED'
  | 'JOB_APPLICATION_CREATED'
  | 'JOB_APPLICATION_APPROVED'
  | 'JOB_APPLICATION_REJECTED'
  | 'FORUM_COMMENT'
  | 'SYSTEM_BROADCAST'
  | 'BROADCAST'
  | 'GLOBAL'
  | string;

export interface NotificationDTO {
  id: number;
  title: string;
  notificationType?: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  username?: string;
  linkId?: number;
}

export interface NotificationPayload {
  id: number | null;
  title: string;
  notificationType?: NotificationType;
  message: string;
  timestamp: number;
  read?: boolean;
  username?: string;
  linkId?: number;
}

export interface NotificationItem {
  id: number | null;
  title: string;
  notificationType?: NotificationType;
  message: string;
  timestamp: number;
  read: boolean;
  username?: string;
  linkId?: number | string;
}

