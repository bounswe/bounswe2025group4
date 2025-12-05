import { useTranslation } from 'react-i18next';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { Badge } from '@shared/components/ui/badge';
import { ScrollArea } from '@shared/components/ui/scroll-area';
import { cn } from '@shared/lib/utils';
import type { ChatRoomForUser } from '@shared/types/chat';

interface ChatRoomListProps {
  rooms: ChatRoomForUser[];
  activeRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

const ChatRoomList = ({ rooms, activeRoomId, onRoomSelect }: ChatRoomListProps) => {
  const { t } = useTranslation('common');

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('chat.justNow');
    if (minutes < 60) return t('chat.minutesAgo', { count: minutes });
    if (hours < 24) return t('chat.hoursAgo', { count: hours });
    if (days < 7) return t('chat.daysAgo', { count: days });
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full border-r border-border bg-background">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">{t('chat.conversations')}</h2>
      </div>

      {/* Room List */}
      <ScrollArea className="flex-1">
        <div className="divide-y divide-border">
          {rooms.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>{t('chat.noConversations')}</p>
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRoomSelect(room.id);
                  }
                }}
                className={cn(
                  'w-full p-4 flex items-start gap-3 hover:bg-accent transition-colors text-left focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset',
                  activeRoomId === room.id && 'bg-accent'
                )}
                aria-label={t('chat.openConversationWith', { name: room.participantName })}
                aria-current={activeRoomId === room.id ? 'true' : undefined}
              >
                {/* Avatar with online status */}
                <div className="relative flex-shrink-0">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={room.participantAvatar} alt={room.participantName} />
                    <AvatarFallback>
                      {room.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {room.isOnline && (
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"
                      aria-label={t('chat.online')}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{room.participantName}</h3>
                    <p className="text-xs text-muted-foreground capitalize">
                      {room.participantRole === 'mentor'
                        ? t('chat.roleMentor')
                        : t('chat.roleMentee')}
                    </p>
                  </div>
                  {room.lastMessageTime && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTime(room.lastMessageTime)}
                    </span>
                  )}
                </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage || t('chat.noMessages')}
                    </p>
                    {room.unreadCount > 0 && (
                      <Badge
                        variant="default"
                        className="ml-2 flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center px-1.5"
                        aria-label={t('chat.unreadMessages', { count: room.unreadCount })}
                      >
                        {room.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatRoomList;


