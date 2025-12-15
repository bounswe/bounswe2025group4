import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import { Button } from '@shared/components/ui/button';
import { Separator } from '@shared/components/ui/separator';
import { useTranslation } from 'react-i18next';
import { useNotifications } from '../hooks/useNotifications';
import type { NotificationItem } from '@shared/types/notification.types';

const formatTimestamp = (timestamp: number) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(timestamp));
  } catch (_err: unknown) {
    return '';
  }
};

const formatNotificationTitle = (title: string): string => {
  // Convert "NEW MESSAGE" to "New Message" and similar patterns
  if (title.startsWith('NEW MESSAGE')) {
    return title.replace(/^NEW MESSAGE/, 'New Message');
  }
  // Handle other uppercase patterns - convert to title case
  return title.replace(/\b([A-Z]+)\b/g, (match) => {
    // If it's all caps and more than 2 characters, convert to title case
    if (match.length > 2 && match === match.toUpperCase()) {
      return match.charAt(0) + match.slice(1).toLowerCase();
    }
    return match;
  });
};

const NotificationListItem = ({
  notification,
  onClick,
}: {
  notification: NotificationItem;
  onClick: (notification: NotificationItem) => void;
}) => {
  const isUnread = !notification.read;

  return (
    <DropdownMenuItem
      onSelect={() => onClick(notification)}
      className={`items-start px-4 py-3 text-left transition-colors hover:bg-muted ${
        isUnread ? 'bg-muted/60' : ''
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span className="font-medium line-clamp-1">{formatNotificationTitle(notification.title)}</span>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatTimestamp(Number(notification.timestamp))}
            </span>
            {isUnread && <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden />}
          </div>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
      </div>
    </DropdownMenuItem>
  );
};

export const NotificationBell = () => {
  const { t } = useTranslation('common');
  const {
    notifications,
    hasUnread,
    unreadCount,
    isOpen,
    setIsOpen,
    isLoading,
    handleNotificationClick,
    markAllAsRead,
  } = useNotifications();

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="px-5 py-4 text-sm text-muted-foreground">
          {t('notifications.loading', 'Loading notifications...')}
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="px-5 py-6 text-sm text-muted-foreground">
          {t('notifications.empty', "You're all caught up. No notifications yet.")}
        </div>
      );
    }

    return (
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <NotificationListItem
            key={`${notification.id ?? 'broadcast'}-${notification.timestamp}-${notification.title}`}
            notification={notification}
            onClick={handleNotificationClick}
          />
        ))}
      </div>
    );
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t('notifications.ariaLabel', 'Notifications')}
          aria-haspopup="menu"
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-100 p-0">
        <DropdownMenuLabel className="px-5 py-2 mt-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{t('notifications.title', 'Notifications')}</span>
            {hasUnread ? (
              <span className="text-xs text-destructive">
                {t('notifications.unread', {
                  count: unreadCount,
                  defaultValue: `${unreadCount} unread`,
                })}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {t('notifications.upToDate', 'Up to date')}
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderList()}
        <Separator />
        <div className="px-5 py-2 text-xs text-muted-foreground flex justify-between">
          <span className="py-1">
            {t('notifications.footer', 'Newest notifications appear first.')}
          </span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              {t('notifications.markAllAsRead', 'Mark all as read')}
            </Button>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;
