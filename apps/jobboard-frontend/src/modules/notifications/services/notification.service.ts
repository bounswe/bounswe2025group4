import { api } from '@shared/lib/api-client';
import type {
  NotificationDTO,
  NotificationItem,
  NotificationPayload,
} from '@shared/types/notification.types';

const toTimestamp = (value: unknown) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : Date.now();
};

export const mapNotification = (
  dto: NotificationDTO | NotificationPayload
): NotificationItem => ({
  id: dto.id ?? null,
  title: dto.title ?? 'Notification',
  message: dto.message ?? '',
  notificationType: dto.notificationType,
  timestamp: toTimestamp(dto.timestamp),
  read: dto.read ?? false,
  username: dto.username,
  linkId: dto.linkId,
});

export async function fetchMyNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<NotificationDTO[]>('/notifications/me');
  return response.data
    .map(mapNotification)
    .sort((a, b) => toTimestamp(b.timestamp) - toTimestamp(a.timestamp));
}

export async function markNotificationAsRead(id: number): Promise<void> {
  await api.post(`/notifications/${id}/read`);
}

