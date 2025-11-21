import type { ChatRoom, ChatMessage } from '@/types/chat';

// Mock chat rooms - Backend'de ACCEPTED mentorship'ler için oluşturulacak
// Her active mentorship için bir channelId var
export const mockChatRooms: ChatRoom[] = [
  {
    id: 'channel-1', // channelId - backend creates this
    mentorshipId: '1', // Reference to active mentorship
    mentorProfileId: 'mentor-profile-1',
    mentorProfileName: 'Alice Johnson',
    mentorProfileAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    mentorOnline: true,
    mentorUnreadCount: 3,
    menteeProfileId: 'mentee-profile-1',
    menteeProfileName: 'Merve Kaya',
    menteeProfileAvatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&h=150&fit=crop&crop=face',
    menteeOnline: true,
    menteeUnreadCount: 2,
    status: 'OPEN',
    lastMessage: 'Great progress on the React hooks!',
    lastMessageTime: '2024-01-20T10:30:00Z',
  },
  {
    id: 'channel-2',
    mentorshipId: '2',
    mentorProfileId: 'mentor-profile-2',
    mentorProfileName: 'John Smith',
    mentorProfileAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    mentorOnline: false,
    mentorUnreadCount: 0,
    menteeProfileId: 'mentee-profile-1',
    menteeProfileName: 'Merve Kaya',
    menteeProfileAvatar: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=150&h=150&fit=crop&crop=face',
    menteeOnline: true,
    menteeUnreadCount: 0,
    status: 'OPEN',
    lastMessage: 'See you next week for our session',
    lastMessageTime: '2024-01-19T15:45:00Z',
  },
];

export const mockMessages: Record<string, ChatMessage[]> = {
  'channel-1': [
    {
      id: 'msg-1',
      senderId: 'mentor-profile-1',
      senderName: 'Alice Johnson',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Hi Merve! How are you progressing with the React hooks exercises we outlined last week?',
      timestamp: '2024-01-20T10:00:00Z',
      read: true,
    },
    {
      id: 'msg-2',
      senderId: 'mentee-profile-1',
      senderName: 'Merve Kaya',
      content: "Hey Alice! I finished the useState/useEffect tasks and refactored the onboarding form. The performance looks a lot better now.",
      timestamp: '2024-01-20T10:15:00Z',
      read: true,
    },
    {
      id: 'msg-3',
      senderId: 'mentor-profile-1',
      senderName: 'Alice Johnson',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Fantastic work! Would you like to do a pairing session so we can review the custom hook together and discuss the testing strategy?',
      timestamp: '2024-01-20T10:30:00Z',
      read: false,
    },
    {
      id: 'msg-4',
      senderId: 'mentor-profile-1',
      senderName: 'Alice Johnson',
      senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'I have a slot tomorrow at 16:00 (GMT+3). We can walk through your branch, add tests, and plan the deployment checklist.',
      timestamp: '2024-01-20T10:31:00Z',
      read: false,
    },
    {
      id: 'msg-5',
      senderId: 'mentee-profile-1',
      senderName: 'Merve Kaya',
      content: 'That works perfectly! I will push the latest changes and prepare a list of questions about context usage before our call.',
      timestamp: '2024-01-20T10:40:00Z',
      read: false,
    },
  ],
  'channel-2': [
    {
      id: 'msg-5',
      senderId: 'mentor-profile-2',
      senderName: 'John Smith',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'Hi Merve, thanks for sharing the product discovery document. I added feedback on the persona section and roadmap assumptions.',
      timestamp: '2024-01-19T15:30:00Z',
      read: true,
    },
    {
      id: 'msg-6',
      senderId: 'mentee-profile-1',
      senderName: 'Merve Kaya',
      content: 'Appreciate it! I will tighten the persona definitions and link the interview notes. The comments were super clear.',
      timestamp: '2024-01-19T15:40:00Z',
      read: true,
    },
    {
      id: 'msg-7',
      senderId: 'mentor-profile-2',
      senderName: 'John Smith',
      senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'Great! Let’s dedicate the next session to prioritisation techniques. Does Tuesday 18:00 GMT+3 still work?',
      timestamp: '2024-01-19T15:45:00Z',
      read: true,
    },
    {
      id: 'msg-8',
      senderId: 'mentee-profile-1',
      senderName: 'Merve Kaya',
      content: 'Yes, Tuesday works. I will prepare the backlog and send a draft lean canvas before then.',
      timestamp: '2024-01-19T15:55:00Z',
      read: true,
    },
  ],
};

