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
      className={`items-start px-0 py-3 text-left transition-colors hover:bg-muted ${
        isUnread ? 'bg-muted/60' : ''
      }`}
    >
      <span
        className={`mt-1 h-2 w-2 rounded-full ${isUnread ? 'bg-red-500' : 'bg-transparent'}`}
        aria-hidden
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium line-clamp-1">{notification.title}</span>
          <span className="text-xs text-muted-foreground whitespace-nowrap px-3">
            {formatTimestamp(Number(notification.timestamp))}
          </span>
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
  } = useNotifications();

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="p-4 text-sm text-muted-foreground">
          {t('notifications.loading', 'Loading notifications...')}
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="p-6 text-sm text-muted-foreground">
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
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
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
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {renderList()}
        <Separator />
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {t('notifications.footer', 'Newest notifications appear first.')}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationBell;

