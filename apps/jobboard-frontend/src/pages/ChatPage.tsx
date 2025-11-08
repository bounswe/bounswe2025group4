import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatInterface from '@/components/chat/ChatInterface';
import { mockChatRooms, mockMessages } from '@/data/mockChat';
import type { ChatRoom, ChatRoomForUser, ChatMessage } from '@/types/chat';
import { useAuth } from '@/stores/authStore';

const ChatPage = () => {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const mentorshipIdFromUrl = searchParams.get('mentorshipId');
  const { user } = useAuth();
  const roleOverride = searchParams.get('as');
  const profileOverride = searchParams.get('profile');

  const candidateProfiles = [
    profileOverride,
    roleOverride === 'mentor' ? 'mentor-profile-1' : undefined,
    roleOverride === 'mentee' ? 'mentee-profile-1' : undefined,
    user?.role === 'ROLE_EMPLOYER' ? 'mentor-profile-1' : undefined,
    user?.role === 'ROLE_JOBSEEKER' ? 'mentee-profile-1' : undefined,
    'mentor-profile-2',
    'mentor-profile-1',
    'mentee-profile-1',
  ].filter((value): value is string => Boolean(value));

  const currentUserProfileId =
    candidateProfiles.find((profileId) =>
      mockChatRooms.some(
        (room) =>
          room.mentorProfileId === profileId ||
          room.menteeProfileId === profileId
      )
    ) ?? 'mentee-profile-1'; // TODO: replace with real profile data when backend is ready
  
  // Mock - Backend gelince: GET /api/chat/rooms (sadece kullanıcının active mentorship'lerini döner)
  const mapRoomForUser = useCallback((room: ChatRoom): ChatRoomForUser => {
    const isCurrentUserMentor = room.mentorProfileId === currentUserProfileId;
    const participantName = isCurrentUserMentor ? room.menteeProfileName : room.mentorProfileName;
    const participantAvatar = isCurrentUserMentor ? room.menteeProfileAvatar : room.mentorProfileAvatar;
    const participantId = isCurrentUserMentor ? room.menteeProfileId : room.mentorProfileId;
    const participantRole: ChatRoomForUser['participantRole'] = isCurrentUserMentor ? 'mentee' : 'mentor';
    const unreadCount = isCurrentUserMentor ? room.mentorUnreadCount : room.menteeUnreadCount;
    const isOnline = isCurrentUserMentor ? room.menteeOnline : room.mentorOnline;

    return {
      ...room,
      participantId,
      participantName,
      participantAvatar,
      participantRole,
      unreadCount,
      isOnline,
    };
  }, [currentUserProfileId]);

  const [rooms, setRooms] = useState<ChatRoomForUser[]>([]);
  
  // Kullanıcının rolüne göre sadece dahil olduğu sohbetleri yükle
  useEffect(() => {
    const visibleRooms = mockChatRooms
      .filter(
        (room) =>
          room.mentorProfileId === currentUserProfileId ||
          room.menteeProfileId === currentUserProfileId
      )
      .map(mapRoomForUser);

    setRooms(visibleRooms);
  }, [currentUserProfileId, mapRoomForUser]);

  // URL'den mentorshipId varsa, o room'u bul ve aç
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>(mockMessages);
  
  // URL parametresi değişince active room'u güncelle
  useEffect(() => {
    if (mentorshipIdFromUrl) {
      const room = rooms.find(r => r.mentorshipId === mentorshipIdFromUrl);
      if (room && room.id !== activeRoomId) {
        setActiveRoomId(room.id);
        return;
      }
    }

    if (!activeRoomId || !rooms.some(room => room.id === activeRoomId)) {
      const fallbackId = rooms[0]?.id ?? null;
      if (fallbackId !== activeRoomId) {
        setActiveRoomId(fallbackId);
      }
    }
  }, [mentorshipIdFromUrl, rooms, activeRoomId]);

  // Kullanıcı rolü / profili değişirse participant bilgilerini yeniden hesapla
  useEffect(() => {
    setRooms(prevRooms => prevRooms.map(mapRoomForUser));
  }, [mapRoomForUser]);

  const activeRoom = rooms.find(room => room.id === activeRoomId);
  const activeMessages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);

    // Mark messages as read
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id !== roomId) {
          return room;
        }

        const updatedRoom: ChatRoomForUser = {
          ...room,
          unreadCount: 0,
          mentorUnreadCount: room.participantRole === 'mentee' ? 0 : room.mentorUnreadCount,
          menteeUnreadCount: room.participantRole === 'mentor' ? 0 : room.menteeUnreadCount,
        };

        return updatedRoom;
      })
    );

    setMessagesByRoom(prevMessages => ({
      ...prevMessages,
      [roomId]: (prevMessages[roomId] || []).map(msg => ({ ...msg, read: true })),
    }));
  };

  const handleSendMessage = (content: string) => {
    if (!activeRoomId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUserProfileId,
      senderName:
        activeRoom?.mentorProfileId === currentUserProfileId
          ? activeRoom.mentorProfileName
          : activeRoom?.menteeProfileName ?? t('chat.you'),
      senderAvatar:
        activeRoom?.mentorProfileId === currentUserProfileId
          ? activeRoom.mentorProfileAvatar
          : activeRoom?.menteeProfileAvatar,
      content,
      timestamp: new Date().toISOString(),
      read: true,
    };

    // Add message to the room
    setMessagesByRoom(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), newMessage],
    }));

    // Update room's last message
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id !== activeRoomId) {
          return room;
        }

        const isCurrentUserMentor = room.participantRole === 'mentee';

        return {
          ...room,
          lastMessage: content,
          lastMessageTime: newMessage.timestamp,
          unreadCount: 0,
          mentorUnreadCount: isCurrentUserMentor ? room.mentorUnreadCount : room.mentorUnreadCount + 1,
          menteeUnreadCount: isCurrentUserMentor ? room.menteeUnreadCount + 1 : room.menteeUnreadCount,
        };
      })
    );
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Sidebar - Chat Rooms (hidden on mobile when chat is open) */}
      <div
        className={`w-full md:min-w-[20rem] md:max-w-[24rem] lg:max-w-[26rem] md:flex-shrink-0 ${
          activeRoom ? 'hidden md:block' : 'block'
        }`}
      >
        <ChatRoomList
          rooms={rooms}
          activeRoomId={activeRoomId}
          onRoomSelect={handleRoomSelect}
        />
      </div>

      {/* Right Panel - Chat Interface (full screen on mobile) */}
      <div className={`flex-1 ${activeRoom ? 'block' : 'hidden md:block'}`}>
        {activeRoom ? (
          <ChatInterface
            room={activeRoom}
            messages={activeMessages}
            onSendMessage={handleSendMessage}
            currentUserId={currentUserProfileId}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-center text-muted-foreground">
            <div>
              <p className="text-lg mb-2">{t('chat.selectConversation')}</p>
              <p className="text-sm">{t('chat.selectConversationDesc')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

