export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface ChatRoom {
  id: string; // Conversation.id / channelId - backend'den gelecek
  mentorshipId: string; // Mentorship ID - ACCEPTED/ACTIVE mentorship
  mentorProfileId: string;
  mentorProfileName: string;
  mentorProfileAvatar?: string;
  mentorOnline: boolean;
  mentorUnreadCount: number;
  menteeProfileId: string;
  menteeProfileName: string;
  menteeProfileAvatar?: string;
  menteeOnline: boolean;
  menteeUnreadCount: number;
  status: 'OPEN' | 'CLOSED';
  lastMessage?: string;
  lastMessageTime?: string;
}

export type ChatParticipantRole = 'mentor' | 'mentee';

export type ChatRoomForUser = ChatRoom & {
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: ChatParticipantRole;
  unreadCount: number;
  isOnline: boolean;
};

export interface ChatContextType {
  rooms: ChatRoomForUser[];
  activeRoomId: string | null;
  messages: ChatMessage[];
  setActiveRoom: (roomId: string) => void;
  sendMessage: (content: string) => void;
  markAsRead: (roomId: string) => void;
}

