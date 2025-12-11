import { useState, useRef, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Download, FileText, ArrowLeft, Upload, X, RefreshCw } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { Label } from '@shared/components/ui/label';
import CenteredLoader from '@shared/components/common/CenteredLoader';
import ChatInterface from '@modules/mentorship/components/chat/ChatInterface';
import { useQueryClient } from '@tanstack/react-query';
import {
  useResumeReviewQuery,
  useResumeFileUrlQuery,
  useUploadResumeFileMutation,
  useMenteeMentorshipsQuery,
  useMentorMentorshipRequestsQuery,
  getMenteeMentorships,
} from '@modules/mentorship/services/mentorship.service';
import { mentorshipKeys } from '@shared/lib/query-keys';
import type { MentorshipDetailsDTO } from '@shared/types/api.types';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { useAuthStore } from '@shared/stores/authStore';
import { normalizeApiError } from '@shared/utils/error-handler';
import { getChatHistory, ChatWebSocket } from '@modules/mentorship/services/chat.service';
import { profileService } from '@modules/profile/services/profile.service';
import type { ChatMessage, ChatRoomForUser } from '@shared/types/chat';
import type { PublicProfile } from '@shared/types/profile.types';

export default function ResumeReviewPage() {
  const { resumeReviewId } = useParams<{ resumeReviewId: string }>();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resumeReviewIdNum = resumeReviewId ? parseInt(resumeReviewId, 10) : undefined;
  const accessToken = useAuthStore((state) => state.accessToken);

  const resumeReviewQuery = useResumeReviewQuery(
    resumeReviewIdNum,
    Boolean(resumeReviewIdNum && user?.id)
  );
  const resumeFileUrlQuery = useResumeFileUrlQuery(
    resumeReviewIdNum,
    Boolean(resumeReviewIdNum && user?.id && (resumeReviewQuery.data?.fileUrl ?? false))
  );
  const uploadResumeFileMutation = useUploadResumeFileMutation(resumeReviewIdNum ?? 0);
  const menteeMentorshipsQuery = useMenteeMentorshipsQuery(user?.id, Boolean(user?.id));
  const mentorRequestsQuery = useMentorMentorshipRequestsQuery(user?.id, Boolean(user?.id));
  const queryClient = useQueryClient();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoomForUser | null>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const wsRef = useRef<ChatWebSocket | null>(null);
  const [mentorProfile, setMentorProfile] = useState<PublicProfile | null>(null);
  const [menteeProfile, setMenteeProfile] = useState<PublicProfile | null>(null);
  const [menteeId, setMenteeId] = useState<number | null>(null);

  // Find mentorship details to get conversationId
  const mentorship = useMemo(() => {
    if (!resumeReviewIdNum) return null;
    const menteeMentorships = menteeMentorshipsQuery.data ?? [];
    return (
      menteeMentorships.find((m) => m.resumeReviewId === resumeReviewIdNum) ?? null
    );
  }, [menteeMentorshipsQuery.data, resumeReviewIdNum]);

  // For mentor: find accepted request with this resumeReviewId
  const mentorMentorship = useMemo(() => {
    if (!resumeReviewIdNum || mentorship) return null;
    const requests = mentorRequestsQuery.data ?? [];
    // We need to find the request that has this resumeReviewId
    // Since we don't have resumeReviewId in request, we'll need to check all accepted requests
    // For now, we'll use the first accepted request (this might need backend support)
    return requests.find((r) => r.status?.toUpperCase() === 'ACCEPTED') ?? null;
  }, [mentorRequestsQuery.data, resumeReviewIdNum, mentorship]);

  const isMentee = Boolean(mentorship);
  const resumeReview = resumeReviewQuery.data ?? null;
  const resumeFileUrl = resumeFileUrlQuery.data ?? resumeReview?.fileUrl ?? null;
  const [conversationId, setConversationId] = useState<number | null>(mentorship?.conversationId ?? null);
  const [mentorMentorshipDetails, setMentorMentorshipDetails] = useState<MentorshipDetailsDTO | null>(null);

  // For mentor: find conversationId by checking mentee's mentorships
  useEffect(() => {
    const findMentorConversationId = async () => {
      if (isMentee || !resumeReviewIdNum || !user?.id || conversationId) return;

      try {
        const acceptedRequests = (mentorRequestsQuery.data ?? []).filter(
          (r) => r.status?.toUpperCase() === 'ACCEPTED'
        );

        for (const request of acceptedRequests) {
          const requesterId =
            typeof request.requesterId === 'string'
              ? parseInt(request.requesterId, 10)
              : request.requesterId;
          if (isNaN(requesterId)) continue;

          try {
            const menteeMentorships = await queryClient.fetchQuery<MentorshipDetailsDTO[]>({
              queryKey: mentorshipKeys.menteeMentorships(requesterId),
              queryFn: () => getMenteeMentorships(requesterId),
            });

            const matchingMentorship = menteeMentorships.find(
              (m) =>
                m.mentorId === user.id &&
                m.resumeReviewId === resumeReviewIdNum &&
                m.conversationId
            );

            if (matchingMentorship?.conversationId) {
              setConversationId(matchingMentorship.conversationId);
              setMentorMentorshipDetails(matchingMentorship);
              setMenteeId(requesterId);
              break;
            }
          } catch (err) {
            console.error(`Error fetching mentee mentorships for requester ${requesterId}:`, err);
          }
        }
      } catch (err) {
        console.error('Error finding mentor conversationId:', err);
      }
    };

    findMentorConversationId();
  }, [isMentee, resumeReviewIdNum, user?.id, mentorRequestsQuery.data, conversationId, queryClient]);

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user?.id) return;

      try {
        if (isMentee && mentorship) {
          // Fetch mentor profile
          const mentorProf = await profileService.getPublicProfile(mentorship.mentorId);
          setMentorProfile(mentorProf);
          // Fetch mentee profile (current user)
          const menteeProf = await profileService.getPublicProfile(user.id);
          setMenteeProfile(menteeProf);
        } else if (!isMentee && mentorMentorshipDetails && menteeId) {
          // For mentor view, fetch mentee profile
          const menteeProf = await profileService.getPublicProfile(menteeId);
          setMenteeProfile(menteeProf);
          
          // Fetch mentor profile (current user)
          const mentorProf = await profileService.getPublicProfile(user.id);
          setMentorProfile(mentorProf);
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
      }
    };

    fetchProfiles();
  }, [user?.id, isMentee, mentorship, mentorMentorshipDetails, menteeId]);

  // Setup chat room
  useEffect(() => {
    if (!conversationId || !user?.id) return;
    
    const activeMentorship = isMentee ? mentorship : mentorMentorshipDetails;
    if (!activeMentorship) return;

    const setupChatRoom = async () => {
      try {
        setIsLoadingChat(true);
        setChatError(null);

        const mentorId = isMentee ? activeMentorship.mentorId : user.id;
        const actualMenteeId = isMentee ? user.id : (menteeId ?? user.id);

        const mentorName = mentorProfile
          ? `${mentorProfile.firstName} ${mentorProfile.lastName}`.trim() || mentorProfile.firstName || (isMentee ? mentorship.mentorUsername : user.username) || 'Mentor'
          : (isMentee ? mentorship.mentorUsername : user.username) || 'Mentor';
        const menteeName = menteeProfile
          ? `${menteeProfile.firstName} ${menteeProfile.lastName}`.trim() || menteeProfile.firstName || (isMentee ? user.username : 'Mentee') || 'Mentee'
          : (isMentee ? user.username : 'Mentee') || 'Mentee';

        const room: ChatRoomForUser = {
          id: conversationId.toString(),
          mentorshipId: (isMentee ? activeMentorship.mentorshipRequestId : (mentorRequestsQuery.data?.[0]?.id || '0')).toString(),
          mentorProfileId: mentorId.toString(),
          mentorProfileName: mentorName,
          mentorProfileAvatar: mentorProfile?.imageUrl,
          mentorOnline: false,
          mentorUnreadCount: 0,
          menteeProfileId: actualMenteeId.toString(),
          menteeProfileName: menteeName,
          menteeProfileAvatar: menteeProfile?.imageUrl,
          menteeOnline: false,
          menteeUnreadCount: 0,
          status: 'OPEN',
          participantId: isMentee ? actualMenteeId.toString() : mentorId.toString(),
          participantName: isMentee ? mentorName : menteeName,
          participantAvatar: isMentee ? mentorProfile?.imageUrl : menteeProfile?.imageUrl,
          participantRole: isMentee ? 'mentee' : 'mentor',
          unreadCount: 0,
          isOnline: false,
        };

        setChatRoom(room);

        // Fetch chat history
        const history = await getChatHistory(conversationId);
        setChatMessages(history);
      } catch (err) {
        console.error('Error setting up chat:', err);
        const normalized = normalizeApiError(err, 'Failed to load chat');
        setChatError(normalized.friendlyMessage);
      } finally {
        setIsLoadingChat(false);
      }
    };

    setupChatRoom();
  }, [conversationId, user?.id, mentorship, mentorMentorshipDetails, mentorProfile, menteeProfile, isMentee, menteeId, mentorRequestsQuery.data]);

  // WebSocket connection
  useEffect(() => {
    if (!conversationId || !accessToken || !chatRoom) return;

    const ws = new ChatWebSocket();
    wsRef.current = ws;

    ws.connect(
      conversationId,
      accessToken,
      (message: ChatMessage) => {
        setChatMessages((prev) => [...prev, message]);
      },
      (error: Error) => {
        console.error('WebSocket error:', error);
        toast.error('Chat connection error');
      },
      () => {
        console.log('WebSocket connected');
      },
      () => {
        console.log('WebSocket disconnected');
      }
    );

    return () => {
      ws.disconnect();
    };
  }, [conversationId, accessToken, chatRoom]);

  const handleSendMessage = (content: string) => {
    if (!wsRef.current || !content.trim()) return;

    try {
      wsRef.current.sendMessage(content);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Failed to send message');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PDF files only.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadResume = async () => {
    if (!resumeReviewIdNum || !selectedFile) return;

    try {
      await uploadResumeFileMutation.mutateAsync(selectedFile);
      toast.success('Resume uploaded successfully!');

      await Promise.all([resumeReviewQuery.refetch(), resumeFileUrlQuery.refetch()]);

      // Refresh chat history to show system message
      if (conversationId) {
        const history = await getChatHistory(conversationId);
        setChatMessages(history);
      }

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      console.error('Error uploading resume:', err);
      const normalized = normalizeApiError(err, 'Failed to upload resume');
      toast.error(normalized.friendlyMessage);
    }
  };

  const handleRefreshResume = async () => {
    await Promise.all([resumeReviewQuery.refetch(), resumeFileUrlQuery.refetch()]);
  };

  const loadError =
    resumeReviewQuery.error || menteeMentorshipsQuery.error || mentorRequestsQuery.error;

  if (!resumeReviewIdNum) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Resume Review Not Found</h1>
        <Button asChild>
          <Link to="/mentorship/my">Back to My Mentorships</Link>
        </Button>
      </div>
    );
  }

  if (loadError) {
    const normalized = normalizeApiError(loadError, 'Failed to load resume review');
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">{normalized.friendlyMessage}</h1>
        <Button asChild>
          <Link to="/mentorship/my">Back to My Mentorships</Link>
        </Button>
      </div>
    );
  }

  if (
    resumeReviewQuery.isLoading ||
    menteeMentorshipsQuery.isLoading ||
    mentorRequestsQuery.isLoading ||
    (resumeReview?.fileUrl && resumeFileUrlQuery.isLoading)
  ) {
    return <CenteredLoader />;
  }

  if (!resumeReview) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold mb-4">Resume Review Not Found</h1>
        <Button asChild>
          <Link to="/mentorship/my">Back to My Mentorships</Link>
        </Button>
      </div>
    );
  }

  const isActive = resumeReview.reviewStatus?.toUpperCase() === 'ACTIVE';
  const isCompleted = resumeReview.reviewStatus?.toUpperCase() === 'COMPLETED';
  const isClosed = resumeReview.reviewStatus?.toUpperCase() === 'CLOSED';

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/mentorship/my" className="hover:text-foreground transition-colors">
          My Mentorships
        </Link>
        <span>/</span>
        <span className="text-foreground">Resume Review</span>
      </nav>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isMentee ? 'Resume Review' : 'Review Resume'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isMentee
              ? 'Upload and discuss your resume with your mentor'
              : 'Review the mentee\'s resume and provide feedback'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link to="/mentorship/my">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {/* Combined Interface: Resume + Chat */}
      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
        {/* Left Panel: Resume Preview */}
        <div className="flex flex-col space-y-4">
          <Card className="flex-1 flex flex-col p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {isMentee ? 'Your Resume' : `${menteeProfile?.firstName || 'Mentee'}'s Resume`}
                </h2>
                {isActive && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                )}
              </div>
              {resumeFileUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshResume}
                  title="Refresh resume"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              {resumeFileUrl ? (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex-1 border border-border rounded-lg overflow-hidden bg-muted/50">
                    <iframe
                      src={resumeFileUrl}
                      className="w-full h-full"
                      title="Resume PDF"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <a
                        href={resumeFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download
                        className="flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                    {isMentee && (
                      <div className="flex-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf"
                          className="hidden"
                        />
                        {selectedFile ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/50 text-sm">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-medium truncate">{selectedFile.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                            <Button
                              onClick={handleUploadResume}
                              disabled={uploadResumeFileMutation.isPending}
                              className="w-full"
                              size="sm"
                            >
                              {uploadResumeFileMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-3 w-3" />
                                  Upload New Resume
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full"
                            size="sm"
                          >
                            <Upload className="mr-2 h-3 w-3" />
                            Upload New
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  {isMentee ? (
                    <div className="text-center space-y-4 p-8">
                      <div className="p-8 border border-dashed border-muted-foreground/30 rounded-lg bg-muted/30">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">No resume uploaded yet</p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept=".pdf"
                          className="hidden"
                        />
                        {selectedFile ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 border rounded-lg bg-background max-w-md mx-auto">
                              <div className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">{selectedFile.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedFile(null);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <Button
                              onClick={handleUploadResume}
                              disabled={uploadResumeFileMutation.isPending}
                              className="w-full max-w-md mx-auto"
                            >
                              {uploadResumeFileMutation.isPending ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="mr-2 h-4 w-4" />
                                  Upload Resume
                                </>
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="max-w-md mx-auto"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Select PDF File
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center border border-dashed border-muted-foreground/30 rounded-lg bg-muted/30">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No resume uploaded yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel: Chat */}
        <div className="flex flex-col">
          <Card className="flex-1 flex flex-col overflow-hidden">
            {conversationId && chatRoom ? (
              <ChatInterface
                room={chatRoom}
                messages={chatMessages}
                onSendMessage={handleSendMessage}
                currentUserId={user?.id?.toString()}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center text-muted-foreground">
                  {isLoadingChat ? (
                    <CenteredLoader />
                  ) : chatError ? (
                    <p>{chatError}</p>
                  ) : (
                    <p>Chat will be available once the mentorship is accepted.</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
