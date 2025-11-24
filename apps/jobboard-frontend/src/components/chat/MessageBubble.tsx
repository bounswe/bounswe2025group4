import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, FileText, Download, Image as ImageIcon } from 'lucide-react';
import type { ChatMessage } from '@/types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwnMessage: boolean;
}

const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  // Check if message is a file attachment
  const isFileMessage = (content: string): { isFile: boolean; fileName?: string; fileSize?: string } => {
    // Pattern: 📎 filename.ext (size KB)
    const filePattern = /^📎\s+(.+?)\s+\((\d+)\s*KB\)$/;
    const match = content.match(filePattern);
    
    if (match) {
      return {
        isFile: true,
        fileName: match[1],
        fileSize: match[2],
      };
    }
    
    return { isFile: false };
  };

  const fileInfo = isFileMessage(message.content);
  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return ImageIcon;
    }
    return FileText;
  };

  const formatTime = (timestamp: string) => {
    // Ensure timestamp is treated as UTC if it doesn't have timezone info
    // Backend sends timestamps in UTC, we need to convert to local timezone
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
        return timestamp; // Return original if still invalid
      }
    }
    
    // toLocaleTimeString automatically converts UTC to local timezone
    // This will show the time in the user's computer timezone
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
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
          {fileInfo.isFile ? (
            // File attachment display
            <div className="flex items-center gap-3 py-1">
              {(() => {
                const FileIcon = getFileIcon(fileInfo.fileName || '');
                return <FileIcon className="h-5 w-5 flex-shrink-0" />;
              })()}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileInfo.fileName}</p>
                <p className="text-xs opacity-80">{fileInfo.fileSize} KB</p>
              </div>
              <Download className="h-4 w-4 opacity-70" />
            </div>
          ) : (
            // Regular text message
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* Timestamp and read status (only for own messages) */}
        <div className={cn('flex items-center gap-1 mt-1', isOwnMessage && 'flex-row-reverse')}>
          <span className="text-xs text-muted-foreground">
            {formatTime(message.timestamp)}
          </span>
          {/* Read status indicators (WhatsApp style) - only for own messages */}
          {isOwnMessage && (
            <span className="flex items-center">
              {message.read ? (
                <CheckCheck className="h-3.5 w-3.5 text-primary" aria-label="Read" />
              ) : (
                <Check className="h-3.5 w-3.5 text-muted-foreground" aria-label="Sent" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;


