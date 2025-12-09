import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SharedStompClient } from '@shared/services/stompClient';
import { notificationKeys } from '@shared/lib/query-keys';
import { useAuth } from '@shared/stores/authStore';
import type { NotificationItem, NotificationPayload } from '@shared/types/notification.types';
import { fetchMyNotifications, markNotificationAsRead, mapNotification } from '../services/notification.service';

const resolveNotificationLink = (notification: NotificationItem): string => {
  const type = notification.notificationType?.toUpperCase() || '';
  const linkId = notification.linkId;

  if (type.includes('CHAT') || type === 'NEW_MESSAGE') {
    return linkId ? `/mentorship/chat/${linkId}` : '/mentorship/chat';
  }

  if (type.includes('JOB_APPLICATION')) {
    return '/jobs/applications';
  }

  if (type.includes('MENTORSHIP')) {
    return '/mentorship/my';
  }

  if (type.includes('FORUM')) {
    return '/forum';
  }

  return '/';
};

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { isAuthenticated, accessToken } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const stompRef = useRef<SharedStompClient | null>(null);
  const unsubscribersRef = useRef<(() => void)[]>([]);

  const sortNotifications = useCallback((list: NotificationItem[]) => {
    return [...list].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
  }, []);

  const upsertNotification = useCallback(
    (incoming: NotificationItem) => {
      setNotifications((prev) => {
        const existingIndex =
          incoming.id !== null ? prev.findIndex((n) => n.id === incoming.id) : -1;

        const next = [...prev];
        if (existingIndex >= 0) {
          next[existingIndex] = { ...next[existingIndex], ...incoming };
        } else {
          next.unshift(incoming);
        }

        return sortNotifications(next);
      });
    },
    [sortNotifications]
  );

  const mergeInitialNotifications = useCallback(
    (initial: NotificationItem[]) => {
      setNotifications((prev) => {
        const byKey = new Map<string, NotificationItem>();
        [...initial, ...prev].forEach((n) => {
          const key =
            n.id !== null ? `id-${n.id}` : `ts-${n.timestamp}-${n.title ?? 'notification'}`;
          const existing = byKey.get(key);
          byKey.set(key, existing ? { ...existing, ...n } : n);
        });

        return sortNotifications(Array.from(byKey.values()));
      });
    },
    [sortNotifications]
  );

  const { isLoading: isLoadingInitial } = useQuery({
    queryKey: notificationKeys.me,
    queryFn: fetchMyNotifications,
    enabled: isAuthenticated,
    staleTime: 30_000,
    onSuccess: (data) => mergeInitialNotifications(data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: (_data, id) => {
      queryClient.setQueryData<NotificationItem[]>(notificationKeys.me, (existing) => {
        if (!existing) return existing;
        return existing.map((n) => (n.id === id ? { ...n, read: true } : n));
      });
    },
    onError: (_error, id) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: false } : n)));
    },
  });

  const markLocalRead = useCallback((notification: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => {
        const isSame =
          notification.id !== null
            ? n.id === notification.id
            : n.id === null &&
              n.title === notification.title &&
              n.timestamp === notification.timestamp;

        if (!isSame) return n;
        return { ...n, read: true };
      })
    );
  }, []);

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      if (!notification.read) {
        markLocalRead(notification);
        if (notification.id !== null) {
          markReadMutation.mutate(notification.id);
        }
      }

      navigate(resolveNotificationLink(notification));
      setIsOpen(false);
    },
    [markLocalRead, markReadMutation, navigate]
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      setNotifications([]);
      return () => {};
    }

    const client = new SharedStompClient({
      token: accessToken,
      debug: import.meta.env.DEV,
      onError: (error) => {
        console.error('[Notifications] STOMP error:', error);
      },
    });

    stompRef.current = client;
    const unsubscribeFns: (() => void)[] = [];

    client
      .connect()
      .then(() => {
        ['/topic/notifications', '/user/queue/notifications'].forEach((destination) => {
          try {
            const unsubscribe = client.subscribe(destination, (message) => {
              try {
                const payload: NotificationPayload = JSON.parse(message.body);
                const mapped = mapNotification({ ...payload, read: payload.read ?? false });
                upsertNotification(mapped);
              } catch (err) {
                console.error('[Notifications] Failed to parse message:', err);
              }
            });
            unsubscribeFns.push(unsubscribe);
          } catch (err) {
            console.error('[Notifications] Failed to subscribe:', err);
          }
        });
      })
      .catch((err) => {
        console.error('[Notifications] Connection failed:', err);
      });

    unsubscribersRef.current = unsubscribeFns;

    return () => {
      unsubscribeFns.forEach((fn) => fn());
      client.disconnect();
      stompRef.current = null;
    };
  }, [accessToken, isAuthenticated, upsertNotification]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      unsubscribersRef.current.forEach((fn) => fn());
      stompRef.current?.disconnect();
      stompRef.current = null;
    }
  }, [isAuthenticated]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );
  const hasUnread = unreadCount > 0;

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    notifications,
    isLoading: isLoadingInitial,
    hasUnread,
    unreadCount,
    isOpen,
    setIsOpen,
    toggleOpen,
    handleNotificationClick,
  };
};

