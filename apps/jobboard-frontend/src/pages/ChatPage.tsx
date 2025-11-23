import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import ChatRoomList from '@/components/chat/ChatRoomList';
import ChatInterface from '@/components/chat/ChatInterface';
import type { ChatRoom, ChatRoomForUser, ChatMessage } from '@/types/chat';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthStore } from '@/stores/authStore';
import { getMenteeMentorships, getMentorMentorshipRequests } from '@/services/mentorship.service';
import { getChatHistory, ChatWebSocket } from '@/services/chat.service';
import { profileService } from '@/services/profile.service';
import type { PublicProfile } from '@/types/profile.types';
import type { MentorshipDetailsDTO, MentorshipRequestDTO } from '@/types/api.types';
import CenteredLoader from '@/components/CenteredLoader';
import { toast } from 'react-toastify';

const ChatPage = () => {
  const { t } = useTranslation('common');
  const [searchParams] = useSearchParams();
  const mentorshipIdFromUrl = searchParams.get('mentorshipId');
  const { user, isAuthenticated } = useAuth();

  const [rooms, setRooms] = useState<ChatRoomForUser[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messagesByRoom, setMessagesByRoom] = useState<Record<string, ChatMessage[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchChatRooms = async () => {
      if (!isAuthenticated || !user?.id) {
        setIsLoading(false);
        return;
      }

      if (mentorshipIdFromUrl && rooms.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [menteeMentorships, mentorRequests] = await Promise.all([
          getMenteeMentorships(user.id).catch((err) => {
            console.error('[ChatPage] Error fetching mentee mentorships:', err);
            return [] as MentorshipDetailsDTO[];
          }),
          getMentorMentorshipRequests(user.id).catch((err) => {
            console.error('[ChatPage] Error fetching mentor requests:', err);
            return [] as MentorshipRequestDTO[];
          }),
        ]);

        // Include both active and completed mentorships for chat
        const activeMenteeMentorships = menteeMentorships.filter(
          m => (m.requestStatus?.toUpperCase() === 'ACCEPTED' || 
                m.reviewStatus?.toUpperCase() === 'ACTIVE' ||
                m.reviewStatus?.toUpperCase() === 'COMPLETED')
        );

        const activeMentorRequests = mentorRequests.filter(
          r => r.status.toUpperCase() === 'ACCEPTED'
        );

        const userIds = new Set<number>();
        activeMenteeMentorships.forEach(m => {
          userIds.add(m.mentorId);
          if (user.id) userIds.add(user.id);
        });
        activeMentorRequests.forEach(r => {
          if (user.id) userIds.add(user.id);
          const requesterId = typeof r.requesterId === 'string' ? parseInt(r.requesterId, 10) : r.requesterId;
          if (!isNaN(requesterId)) userIds.add(requesterId);
        });

        const profilesMap: Record<number, PublicProfile> = {};
        await Promise.all(
          Array.from(userIds).map(async (userId) => {
            try {
              const profile = await profileService.getPublicProfile(userId);
              profilesMap[userId] = profile;
            } catch (err) {
              console.error(`Error fetching profile for user ${userId}:`, err);
            }
          })
        );
        const chatRooms: ChatRoom[] = [];
        for (const mentorship of activeMenteeMentorships) {
          const mentorProfile = profilesMap[mentorship.mentorId];
          const menteeProfile = profilesMap[user.id];

          const mentorName = mentorProfile 
            ? `${mentorProfile.firstName} ${mentorProfile.lastName}`.trim() || mentorProfile.firstName || mentorship.mentorUsername || 'Mentor'
            : mentorship.mentorUsername || 'Mentor';
          const menteeName = menteeProfile 
            ? `${menteeProfile.firstName} ${menteeProfile.lastName}`.trim() || menteeProfile.firstName || user?.username || 'You'
            : user?.username || 'You';
          const mentorAvatar = mentorProfile?.imageUrl;
          const menteeAvatar = menteeProfile?.imageUrl;

          const roomId = mentorship.conversationId 
            ? mentorship.conversationId.toString() 
            : `review-${mentorship.resumeReviewId || mentorship.mentorshipRequestId}`;

          chatRooms.push({
            id: roomId,
            mentorshipId: mentorship.mentorshipRequestId.toString(),
            mentorProfileId: mentorship.mentorId.toString(),
            mentorProfileName: mentorName,
            mentorProfileAvatar: mentorAvatar,
            mentorOnline: false,
            mentorUnreadCount: 0,
            menteeProfileId: user.id.toString(),
            menteeProfileName: menteeName,
            menteeProfileAvatar: menteeAvatar,
            menteeOnline: false,
            menteeUnreadCount: 0,
            status: 'OPEN',
            lastMessage: undefined,
            lastMessageTime: undefined,
          });
        }

        // From mentor perspective - need to get conversationId from mentee's mentorship
        for (const request of activeMentorRequests) {
          const requesterId = typeof request.requesterId === 'string' ? parseInt(request.requesterId, 10) : request.requesterId;
          if (isNaN(requesterId)) continue;

          // Find the corresponding mentee mentorship to get conversationId
          try {
            const menteeMentorships = await getMenteeMentorships(requesterId);
            const matchingMentorship = menteeMentorships.find(
              m => m.mentorId === user.id && 
                   (m.requestStatus?.toUpperCase() === 'ACCEPTED' || m.reviewStatus?.toUpperCase() === 'ACTIVE') &&
                   m.conversationId
            );

            if (!matchingMentorship || !matchingMentorship.conversationId) continue;

            const existingRoom = chatRooms.find(r => r.id === matchingMentorship.conversationId.toString());
            if (existingRoom) continue;

            const mentorProfile = profilesMap[user.id];
            const menteeProfile = profilesMap[requesterId];

            // Use profiles if available, otherwise use usernames
            const mentorName = mentorProfile 
              ? `${mentorProfile.firstName} ${mentorProfile.lastName}`.trim() || mentorProfile.firstName || user?.username || 'Mentor'
              : user?.username || 'Mentor';
            // For mentee, we don't have username in request, so use profile or placeholder
            const menteeName = menteeProfile 
              ? `${menteeProfile.firstName} ${menteeProfile.lastName}`.trim() || menteeProfile.firstName || 'Mentee'
              : 'Mentee';
            const mentorAvatar = mentorProfile?.imageUrl;
            const menteeAvatar = menteeProfile?.imageUrl;

            chatRooms.push({
              id: matchingMentorship.conversationId.toString(),
              mentorshipId: request.id,
              mentorProfileId: user.id.toString(),
              mentorProfileName: mentorName,
              mentorProfileAvatar: mentorAvatar,
              mentorOnline: false,
              mentorUnreadCount: 0,
              menteeProfileId: requesterId.toString(),
              menteeProfileName: menteeName,
              menteeProfileAvatar: menteeAvatar,
              menteeOnline: false,
              menteeUnreadCount: 0,
              status: 'OPEN',
              lastMessage: undefined,
              lastMessageTime: undefined,
            });
          } catch (err) {
            console.error(`Error fetching mentee mentorships for requester ${requesterId}:`, err);
          }
        }

        const mappedRooms: ChatRoomForUser[] = chatRooms.map((room): ChatRoomForUser => {
          // Determine the other participant (not the current user)
          const isCurrentUserMentor = room.mentorProfileId === user.id?.toString();
          const participantName = isCurrentUserMentor ? room.menteeProfileName : room.mentorProfileName;
          const participantAvatar = isCurrentUserMentor ? room.menteeProfileAvatar : room.mentorProfileAvatar;
          const participantId = isCurrentUserMentor ? room.menteeProfileId : room.mentorProfileId;
          // participantRole is kept for type compatibility but not used in logic
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
        });

        setRooms(mappedRooms);

        const messagesMap: Record<string, ChatMessage[]> = {};
        await Promise.all(
          mappedRooms.map(async (room) => {
            try {
              if (room.id.startsWith('review-') || room.id.startsWith('temp-')) {
                messagesMap[room.id] = [];
                return;
              }

              const conversationId = parseInt(room.id, 10);
              if (!isNaN(conversationId)) {
                const history = await getChatHistory(conversationId);
                messagesMap[room.id] = history;
              } else {
                messagesMap[room.id] = [];
              }
            } catch (err) {
              console.error(`[ChatPage] Error fetching chat history for room ${room.id}:`, err);
              messagesMap[room.id] = [];
            }
          })
        );
        
        setMessagesByRoom(messagesMap);

        // Update rooms with last message and unread count
        // Note: activeRoomId will be set later, so we'll calculate unread count for all rooms
        // and then mark active room messages as read in a separate effect
        const currentUserIdStr = user.id?.toString();
        setRooms(prevRooms => 
          prevRooms.map(room => {
            const messages = messagesMap[room.id] || [];
            if (messages.length === 0) {
              return {
                ...room,
                unreadCount: 0,
              };
            }

            // Get last message
            const lastMessage = messages[messages.length - 1];
            
            // Calculate unread count (messages not read and not sent by current user)
            const unreadCount = messages.filter(m => {
              const isOwnMessage = m.senderId === currentUserIdStr;
              return !m.read && !isOwnMessage;
            }).length;

            return {
              ...room,
              lastMessage: lastMessage.content,
              lastMessageTime: lastMessage.timestamp,
              unreadCount,
            };
          })
        );
      } catch (err) {
        console.error('[ChatPage] Error fetching chat rooms:', err);
        setError('Failed to load chat rooms. Please try again later.');
        setIsLoading(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (!mentorshipIdFromUrl) {
      fetchChatRooms();
    }
  }, [isAuthenticated, user?.id, mentorshipIdFromUrl]);

  useEffect(() => {
    const createRoomFromMentorshipId = async () => {
      if (!mentorshipIdFromUrl || !user?.id || !isAuthenticated) {
        setIsLoading(false);
        return;
      }
      
      if (rooms.length > 0) {
        const existingRoom = rooms.find(r => r.mentorshipId === mentorshipIdFromUrl);
        if (existingRoom) {
          setActiveRoomId(existingRoom.id);
          setIsLoading(false);
          return;
        }
      }

      setIsLoading(true);
      setError(null);

      try {
        let menteeMentorships: MentorshipDetailsDTO[] = [];
        try {
          menteeMentorships = await getMenteeMentorships(user.id);
        } catch (err) {
          console.error('[ChatPage] Error fetching mentee mentorships for URL mentorshipId:', err);
          setError('Unable to load mentorship. Please check your connection and try again.');
          setIsLoading(false);
          return;
        }
        
        const mentorship = menteeMentorships.find(
          m => m.mentorshipRequestId.toString() === mentorshipIdFromUrl
        );

        if (mentorship) {
          const mentorProfile = await profileService.getPublicProfile(mentorship.mentorId).catch(() => null);
          const menteeProfile = await profileService.getPublicProfile(user.id).catch(() => null);

          const mentorName = mentorProfile 
            ? `${mentorProfile.firstName} ${mentorProfile.lastName}`.trim() || mentorProfile.firstName || mentorship.mentorUsername || 'Mentor'
            : mentorship.mentorUsername || 'Mentor';
          const menteeName = menteeProfile 
            ? `${menteeProfile.firstName} ${menteeProfile.lastName}`.trim() || menteeProfile.firstName || user?.username || 'You'
            : user?.username || 'You';
          const mentorAvatar = mentorProfile?.imageUrl || undefined;
          const menteeAvatar = menteeProfile?.imageUrl || undefined;

          const roomId = mentorship.conversationId?.toString() || `temp-${mentorshipIdFromUrl}`;
          
          const newRoom: ChatRoomForUser = {
            id: roomId,
            mentorshipId: mentorshipIdFromUrl,
            mentorProfileId: mentorship.mentorId.toString(),
            mentorProfileName: mentorName,
            mentorProfileAvatar: mentorAvatar,
            mentorOnline: false,
            mentorUnreadCount: 0,
            menteeProfileId: user.id.toString(),
            menteeProfileName: menteeName,
            menteeProfileAvatar: menteeAvatar,
            menteeOnline: false,
            menteeUnreadCount: 0,
            status: 'OPEN',
            participantId: mentorship.mentorId.toString(),
            participantName: mentorName,
            participantAvatar: mentorAvatar,
            participantRole: 'mentor',
            unreadCount: 0,
            isOnline: false,
          };

          setRooms(prev => {
            // Check if room already exists
            if (prev.some(r => r.mentorshipId === mentorshipIdFromUrl)) {
              return prev;
            }
            return [...prev, newRoom];
          });
          setActiveRoomId(roomId);
          setIsLoading(false);

          // If conversationId exists, load message history
          if (mentorship.conversationId) {
            try {
              const history = await getChatHistory(mentorship.conversationId);
              setMessagesByRoom(prev => ({
                ...prev,
                [roomId]: history,
              }));
            } catch (err) {
              console.error('[ChatPage] Error loading chat history:', err);
              setMessagesByRoom(prev => ({
                ...prev,
                [roomId]: [],
              }));
            }
          } else {
            setMessagesByRoom(prev => ({
              ...prev,
              [roomId]: [],
            }));
          }
          return;
        }

        // Try to find in mentor requests
        let mentorRequests: MentorshipRequestDTO[] = [];
        try {
          mentorRequests = await getMentorMentorshipRequests(user.id);
        } catch (err) {
          console.error('[ChatPage] Error fetching mentor requests for URL mentorshipId:', err);
          // If already found in mentee mentorships, continue
          if (!mentorship) {
            setError('Unable to load mentorship. Please check your connection and try again.');
            setIsLoading(false);
            return;
          }
        }
        
        const request = mentorRequests.find(r => r.id.toString() === mentorshipIdFromUrl);

        if (request) {
          const requesterId = typeof request.requesterId === 'string' 
            ? parseInt(request.requesterId, 10) 
            : request.requesterId;
          
          if (!isNaN(requesterId)) {
            // Get mentee's mentorships to find conversationId
            try {
              const menteeMentorships = await getMenteeMentorships(requesterId);
              const matchingMentorship = menteeMentorships.find(
                m => m.mentorId === user.id && 
                     (m.requestStatus?.toUpperCase() === 'ACCEPTED' || m.reviewStatus?.toUpperCase() === 'ACTIVE')
              );

              const mentorProfile = await profileService.getPublicProfile(user.id).catch(() => null);
              const menteeProfile = await profileService.getPublicProfile(requesterId).catch(() => null);

              // Use profile data if available, otherwise use placeholders
              const mentorName = mentorProfile 
                ? `${mentorProfile.firstName} ${mentorProfile.lastName}`.trim() || mentorProfile.firstName || 'Mentor'
                : 'Mentor';
              // For mentee, we need to get username from somewhere - try to get from user context or use placeholder
              const menteeName = menteeProfile 
                ? `${menteeProfile.firstName} ${menteeProfile.lastName}`.trim() || menteeProfile.firstName || 'Mentee'
                : 'Mentee';
              const mentorAvatar = mentorProfile?.imageUrl || undefined;
              const menteeAvatar = menteeProfile?.imageUrl || undefined;

              const conversationId = matchingMentorship?.conversationId;
              const roomId = conversationId?.toString() || `temp-${mentorshipIdFromUrl}`;

              const newRoom: ChatRoomForUser = {
                id: roomId,
                mentorshipId: mentorshipIdFromUrl,
                mentorProfileId: user.id.toString(),
                mentorProfileName: mentorName,
                mentorProfileAvatar: mentorAvatar,
                mentorOnline: false,
                mentorUnreadCount: 0,
                menteeProfileId: requesterId.toString(),
                menteeProfileName: menteeName,
                menteeProfileAvatar: menteeAvatar,
                menteeOnline: false,
                menteeUnreadCount: 0,
                status: 'OPEN',
                participantId: requesterId.toString(),
                participantName: menteeName,
                participantAvatar: menteeAvatar,
                participantRole: 'mentee',
                unreadCount: 0,
                isOnline: false,
              };

              setRooms(prev => {
                if (prev.some(r => r.mentorshipId === mentorshipIdFromUrl)) {
                  return prev;
                }
                return [...prev, newRoom];
              });
              setActiveRoomId(roomId);
              setIsLoading(false);

              if (conversationId) {
                try {
                  const history = await getChatHistory(conversationId);
                  setMessagesByRoom(prev => ({
                    ...prev,
                    [roomId]: history,
                  }));
                } catch (err) {
                  console.error('[ChatPage] Error loading chat history:', err);
                  setMessagesByRoom(prev => ({
                    ...prev,
                    [roomId]: [],
                  }));
                }
              } else {
                setMessagesByRoom(prev => ({
                  ...prev,
                  [roomId]: [],
                }));
              }
            } catch (err) {
              console.error('[ChatPage] Error fetching mentee mentorships:', err);
              setIsLoading(false);
            }
          }
        }
        
        if (!mentorship && !request) {
          setError(`Mentorship with ID ${mentorshipIdFromUrl} not found. It may have been deleted or you may not have access to it.`);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('[ChatPage] Error creating room from mentorshipId:', err);
        // Show user-friendly error
        if (err && typeof err === 'object' && 'code' in err) {
          const axiosError = err as { code?: string; message?: string };
          if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
            setError('Connection timeout. Please check if the backend server is running and try again.');
          } else {
            setError('Unable to load mentorship. Please try again later.');
          }
        } else {
          setError('Unable to load mentorship. Please try again later.');
        }
        setIsLoading(false);
      }
    };

    // Only run if we have a mentorshipId in URL and haven't found the room yet
    if (mentorshipIdFromUrl && (!rooms.length || !rooms.some(r => r.mentorshipId === mentorshipIdFromUrl))) {
      createRoomFromMentorshipId();
    } else if (!mentorshipIdFromUrl) {
      // If no mentorshipId in URL, ensure loading is false (fetchChatRooms will handle it)
      setIsLoading(false);
    }
  }, [mentorshipIdFromUrl, user?.id, isAuthenticated, rooms]);

  // Set active room from URL parameter
  useEffect(() => {
    if (mentorshipIdFromUrl && rooms.length > 0) {
      const room = rooms.find(r => r.mentorshipId === mentorshipIdFromUrl);
      if (room) {
        const roomId = room.id;
        setActiveRoomId(roomId);
        
        // Mark messages in this room as read immediately
        if (user?.id) {
          const currentUserIdStr = user.id.toString();
          setMessagesByRoom(prev => {
            const roomMessages = prev[roomId] || [];
            if (roomMessages.length === 0) return prev;

            return {
              ...prev,
              [roomId]: roomMessages.map(msg => {
                const isOwnMessage = msg.senderId === currentUserIdStr;
                return {
                  ...msg,
                  read: isOwnMessage ? true : true, // All messages in active room are read
                };
              }),
            };
          });

          // Reset unread count for this room
          setRooms(prevRooms =>
            prevRooms.map(r => {
              if (r.id === roomId) {
                return {
                  ...r,
                  unreadCount: 0,
                };
              }
              return r;
            })
          );
        }
        return;
      }
    }

    if (!activeRoomId && rooms.length > 0) {
      const firstRoomId = rooms[0].id;
      setActiveRoomId(firstRoomId);
      
      // Mark messages in first room as read immediately
      if (user?.id) {
        const currentUserIdStr = user.id.toString();
        setMessagesByRoom(prev => {
          const roomMessages = prev[firstRoomId] || [];
          if (roomMessages.length === 0) return prev;

          return {
            ...prev,
            [firstRoomId]: roomMessages.map(msg => {
              const isOwnMessage = msg.senderId === currentUserIdStr;
              return {
                ...msg,
                read: isOwnMessage ? true : true, // All messages in active room are read
              };
            }),
          };
        });

        // Reset unread count for first room
        setRooms(prevRooms =>
          prevRooms.map(room => {
            if (room.id === firstRoomId) {
              return {
                ...room,
                unreadCount: 0,
              };
            }
            return room;
          })
        );
      }
    }
  }, [mentorshipIdFromUrl, rooms, activeRoomId, user?.id]);

  const activeRoom = rooms.find(room => room.id === activeRoomId);
  const activeMessages = activeRoomId ? messagesByRoom[activeRoomId] || [] : [];

  useEffect(() => {
    // Disconnect previous connection
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    // Connect to new active room if it has a valid conversationId
    if (activeRoomId && activeRoom && accessToken && isAuthenticated) {
      if (!activeRoomId.startsWith('review-') && !activeRoomId.startsWith('temp-')) {
        const conversationId = parseInt(activeRoomId, 10);
        if (!isNaN(conversationId)) {
          const ws = new ChatWebSocket();
          wsRef.current = ws;

          ws.connect(
            conversationId,
            accessToken,
            (message: ChatMessage) => {
              // Add received message to state
              // If this is our own message (same senderId and similar content), replace optimistic message
              setMessagesByRoom(prev => {
                const currentMessages = prev[activeRoomId] || [];
                const optimisticIndex = currentMessages.findIndex(
                  msg => msg.id.startsWith('temp-') && 
                         msg.senderId === message.senderId &&
                         msg.content === message.content
                );
                
                if (optimisticIndex >= 0) {
                  // Replace optimistic message with real one
                  // If it's our own message and we're viewing the chat, mark it as read
                  const isOwnMessage = message.senderId === user?.id?.toString();
                  const updated = [...currentMessages];
                  updated[optimisticIndex] = {
                    ...message,
                    read: isOwnMessage ? true : message.read, // Our own messages are always "read" (sent)
                  };
                  return {
                    ...prev,
                    [activeRoomId]: updated,
                  };
                } else {
                  // Add new message
                  // If it's from the other person and we're viewing the chat, mark it as read
                  const isOwnMessage = message.senderId === user?.id?.toString();
                  const newMessage: ChatMessage = {
                    ...message,
                    read: isOwnMessage ? true : (activeRoomId === activeRoom?.id ? true : message.read),
                  };
                  return {
                    ...prev,
                    [activeRoomId]: [...currentMessages, newMessage],
                  };
                }
              });

              // Update room's last message and unread count
              setRooms(prevRooms =>
                prevRooms.map(room => {
                  if (room.id !== activeRoomId) {
                    // If message is from another user and room is not active, increment unread count
                    const isOwnMessage = message.senderId === user?.id?.toString();
                    if (!isOwnMessage) {
                      return {
                        ...room,
                        lastMessage: message.content,
                        lastMessageTime: message.timestamp,
                        unreadCount: room.unreadCount + 1,
                      };
                    }
                    return {
                      ...room,
                      lastMessage: message.content,
                      lastMessageTime: message.timestamp,
                    };
                  }
                  // If room is active, message is already marked as read
                  return {
                    ...room,
                    lastMessage: message.content,
                    lastMessageTime: message.timestamp,
                    unreadCount: 0, // Active room has no unread messages
                  };
                })
              );
            },
            (error: Error) => {
              console.error('[ChatPage] WebSocket error:', error);
              toast.error('Chat connection error. Please refresh the page.');
            },
            () => {},
            () => {}
          );
        }
      }
    }

    // Cleanup on unmount or room change
    return () => {
      if (wsRef.current) {
        wsRef.current.disconnect();
        wsRef.current = null;
      }
    };
  }, [activeRoomId, activeRoom, accessToken, isAuthenticated]);

  // Mark messages as read when active room changes or is set
  useEffect(() => {
    if (!activeRoomId || !user?.id) return;

    const currentUserIdStr = user.id.toString();
    
    // Mark messages as read for active room
    setMessagesByRoom(prev => {
      const roomMessages = prev[activeRoomId] || [];
      if (roomMessages.length === 0) return prev;

      const hasUnreadMessages = roomMessages.some(
        msg => !msg.read && msg.senderId !== currentUserIdStr
      );

      if (!hasUnreadMessages) return prev;

      return {
        ...prev,
        [activeRoomId]: roomMessages.map(msg => {
          const isOwnMessage = msg.senderId === currentUserIdStr;
          return {
            ...msg,
            read: isOwnMessage ? true : true, // All messages in active room are read
          };
        }),
      };
    });

    // Reset unread count for active room
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id === activeRoomId) {
          return {
            ...room,
            unreadCount: 0,
          };
        }
        return room;
      })
    );
  }, [activeRoomId, user?.id]);

  const handleRoomSelect = (roomId: string) => {
    setActiveRoomId(roomId);

    // Mark messages in this room as read
    const currentUserIdStr = user?.id?.toString();
    setMessagesByRoom(prev => {
      const roomMessages = prev[roomId] || [];
      return {
        ...prev,
        [roomId]: roomMessages.map(msg => {
          // Mark as read if it's not our own message
          const isOwnMessage = msg.senderId === currentUserIdStr;
          return {
            ...msg,
            read: isOwnMessage ? true : true, // All messages in active room are read
          };
        }),
      };
    });

    // Update room unread count to 0
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id !== roomId) {
          return room;
        }
        return {
          ...room,
          unreadCount: 0,
        };
      })
    );

    // Mark all messages in this room as read
    setMessagesByRoom(prevMessages => ({
      ...prevMessages,
      [roomId]: (prevMessages[roomId] || []).map(msg => ({ ...msg, read: true })),
    }));
  };

  const handleSendMessage = (content: string) => {
    if (!activeRoomId || !activeRoom || !user?.id) return;

    if (activeRoomId.startsWith('review-') || activeRoomId.startsWith('temp-')) {
      toast.warning('Chat is not ready yet. Please wait a moment and try again.');
      return;
    }

    // Create optimistic message (will be replaced by real message from WebSocket)
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: user.id.toString(),
      senderName: user.username || 'You',
      senderAvatar: undefined,
      content: content,
      timestamp: new Date().toISOString(),
      read: false,
    };

    // Add message optimistically to state immediately
    setMessagesByRoom(prev => ({
      ...prev,
      [activeRoomId]: [...(prev[activeRoomId] || []), optimisticMessage],
    }));

    // Update room's last message
    setRooms(prevRooms =>
      prevRooms.map(room => {
        if (room.id !== activeRoomId) {
          return room;
        }
        return {
          ...room,
          lastMessage: content,
          lastMessageTime: new Date().toISOString(),
        };
      })
    );

    // Send message via WebSocket
    if (wsRef.current && wsRef.current.isConnected()) {
      try {
        wsRef.current.sendMessage(content);
      } catch (error) {
        console.error('[ChatPage] Error sending message:', error);
        toast.error('Failed to send message. Please try again.');
        setMessagesByRoom(prev => ({
          ...prev,
          [activeRoomId]: (prev[activeRoomId] || []).filter(msg => msg.id !== optimisticMessage.id),
        }));
      }
    } else {
      // WebSocket not connected, but keep the message visible
      // User will see it, and it will be sent when connection is established
      toast.warning(t('chat.connectionNotReady') || 'Chat connection is not ready. Message will be sent when connection is established.');
      /**
       * TODO: Implement message queue for offline messages.
       * Store messages in localStorage or IndexedDB when offline,
       * and send them when WebSocket connection is established.
       */
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-lg mb-2">{t('chat.authRequired') || 'You must be logged in to use chat'}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <CenteredLoader />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-lg mb-2 text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground">Check console for details</p>
        </div>
      </div>
    );
  }

  // Show empty state if no rooms
  if (rooms.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-lg mb-2">{t('chat.noConversations') || 'No active conversations'}</p>
          <p className="text-sm text-muted-foreground">
            {t('chat.noConversationsDesc') || 'You need to have an active mentorship to start chatting.'}
          </p>
        </div>
      </div>
    );
  }

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
            currentUserId={user?.id?.toString() || ''}
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
