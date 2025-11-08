import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={cn(
        'flex gap-3 mb-4',
        isOwnMessage && 'flex-row-reverse'
      )}
    >
      {/* Avatar (only for other person's messages) */}
      {!isOwnMessage && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={message.senderAvatar} alt={message.senderName} />
          <AvatarFallback className="text-xs">
            {message.senderName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[70%]', isOwnMessage && 'items-end')}>
        {/* Sender name (only for other person's messages) */}
        {!isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1 ml-1">
            {message.senderName}
          </span>
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2 break-words',
            isOwnMessage
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Timestamp */}
        <span className="text-xs text-muted-foreground mt-1 mx-1">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;


