import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, MoreVertical, ArrowLeft } from 'lucide-react';
import MessageBubble from './MessageBubble';
import type { ChatRoomForUser, ChatMessage } from '@/types/chat';

interface ChatInterfaceProps {
  room: ChatRoomForUser;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  currentUserId?: string;
}

const ChatInterface = ({ room, messages, onSendMessage, currentUserId = 'current-user' }: ChatInterfaceProps) => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const [messageInput, setMessageInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = () => {
    const trimmedMessage = messageInput.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessageInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
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
          <div className="relative">
            <Avatar className="w-10 h-10">
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
          <div>
            <h2 className="font-semibold">{room.participantName}</h2>
            <p className="text-xs text-muted-foreground">
              {room.isOnline ? t('chat.online') : t('chat.offline')}
            </p>
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
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
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
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('chat.attachFile')}
            title={t('chat.featureComingSoon')}
            disabled
            aria-disabled="true"
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            ref={inputRef}
            type="text"
            placeholder={t('chat.typeMessage')}
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyPress}
            className="flex-1"
            aria-label={t('chat.messageInput')}
          />

          <Button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            size="icon"
            aria-label={t('chat.sendMessage')}
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

