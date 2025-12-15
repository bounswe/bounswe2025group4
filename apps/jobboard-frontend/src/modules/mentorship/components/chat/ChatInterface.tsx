import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/components/ui/avatar';
import { ScrollArea } from '@shared/components/ui/scroll-area';
import { Send, MoreVertical, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import type { ChatRoomForUser, ChatMessage } from '@shared/types/chat';

interface ChatInterfaceProps {
  room: ChatRoomForUser;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId?: string;
  disabled?: boolean;
  onMessagesViewed?: () => void; // Callback when messages are viewed (to update unread count)
  autoScrollOnMount?: boolean; // Auto scroll to bottom when component mounts
}

const ChatInterface = ({ room, messages, onSendMessage, currentUserId = 'current-user', disabled = false, onMessagesViewed, autoScrollOnMount = false }: ChatInterfaceProps) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUnreadCountRef = useRef<number>(0);

  const scrollToBottom = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        requestAnimationFrame(() => {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        });
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        const isAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 50;
        
        // If user is at bottom OR if the last message is from current user, always scroll
        const lastMessage = messages[messages.length - 1];
        const isMyMessage = lastMessage?.senderId === currentUserId;
        
        if (isAtBottom || isMyMessage) {
          requestAnimationFrame(() => {
            scrollElement.scrollTop = scrollElement.scrollHeight;
            // Mark messages as read when scrolled to bottom and there are unread messages
            if (onMessagesViewed && (room.unreadCount ?? 0) > 0 && isAtBottom) {
              onMessagesViewed();
              lastUnreadCountRef.current = 0;
            }
          });
        }
      }
    }
  }, [messages.length, onMessagesViewed, room.unreadCount, currentUserId, messages]); // Trigger on message count change

  // Auto scroll to bottom when component mounts (if autoScrollOnMount is true)
  useEffect(() => {
    if (autoScrollOnMount && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
        // If at bottom and there are unread messages, mark as viewed
        if (onMessagesViewed && (room.unreadCount ?? 0) > 0) {
          onMessagesViewed();
          lastUnreadCountRef.current = 0;
        }
      }, 200);
    }
  }, [autoScrollOnMount, messages.length, onMessagesViewed, room.unreadCount, scrollToBottom]);

  // Mark messages as read when chat is first opened (if at bottom)
  useEffect(() => {
    if (scrollAreaRef.current && onMessagesViewed && (room.unreadCount ?? 0) > 0) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
      if (scrollElement) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          const isAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 50;
          if (isAtBottom) {
            onMessagesViewed();
            lastUnreadCountRef.current = 0;
          }
        }, 100);
      }
    }
  }, [room.id, onMessagesViewed]); // Only when room changes

  // Mark messages as read when user scrolls to bottom
  useEffect(() => {
    const scrollElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    if (!scrollElement) return;

    const handleScroll = () => {
      const isAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 50;
      if (isAtBottom && onMessagesViewed && (room.unreadCount ?? 0) > 0) {
        onMessagesViewed();
        lastUnreadCountRef.current = 0;
      }
    };

    scrollElement.addEventListener('scroll', handleScroll);
    
    // Also check on mount if already at bottom
    const isAtBottom = scrollElement.scrollHeight - scrollElement.scrollTop <= scrollElement.clientHeight + 50;
    if (isAtBottom && onMessagesViewed && (room.unreadCount ?? 0) > 0) {
      onMessagesViewed();
      lastUnreadCountRef.current = 0;
    }

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
    };
  }, [onMessagesViewed, room.unreadCount]);

  // Reset lastUnreadCount when room changes
  useEffect(() => {
    lastUnreadCountRef.current = room.unreadCount ?? 0;
  }, [room.id, room.unreadCount]);

  const handleSendMessage = () => {
    if (disabled) return;
    const trimmedMessage = messageInput.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessageInput('');
      inputRef.current?.focus();
      // Scroll to bottom after sending message
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          {/* Back button (mobile only) */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => navigate('/chat')}
            aria-label={t('chat.back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="w-10 h-10">
            <AvatarImage src={room.participantAvatar} alt={room.participantName} />
            <AvatarFallback>
              {room.participantName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{room.participantName}</h2>
              {(() => {
                const unread = room.unreadCount ?? 0;
                console.log('[ChatInterface] Rendering unread badge, unreadCount:', unread, 'room:', room);
                return unread > 0 ? (
                  <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-primary rounded-full">
                    {unread > 99 ? '99+' : unread}
                  </span>
                ) : null;
              })()}
            </div>
            {(() => {
              const unread = room.unreadCount ?? 0;
              return unread > 0 ? (
                <p className="text-xs text-primary font-medium">
                  {unread} {unread === 1 ? 'unread message' : 'unread messages'}
                </p>
              ) : null;
            })()}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          aria-label={t('chat.moreOptions')}
          title={t('chat.featureComingSoon')}
          disabled
          aria-disabled="true"
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 h-full">
          <div className="p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[200px] text-center text-muted-foreground">
                <div>
                  <p className="mb-2">{t('chat.noMessagesYet')}</p>
                  <p className="text-sm">{t('chat.startConversation')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwnMessage={message.senderId === currentUserId}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder={disabled ? (t('chat.disabled', 'Chat is disabled for completed mentorships') || 'Chat is disabled for completed mentorships') : (t('chat.typeMessage') || 'Type a message...')}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            aria-label={t('chat.messageInput') || 'Message input'}
            disabled={disabled}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || disabled}
            size="icon"
            aria-label={t('chat.sendMessage') || 'Send message'}
            className="flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
