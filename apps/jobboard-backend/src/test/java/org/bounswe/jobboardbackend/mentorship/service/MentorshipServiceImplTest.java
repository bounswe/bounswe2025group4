package org.bounswe.jobboardbackend.mentorship.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.dto.*;
import org.bounswe.jobboardbackend.mentorship.model.*;
import org.bounswe.jobboardbackend.mentorship.repository.*;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MentorshipServiceImplTest {

    @Mock
    private MentorProfileRepository mentorProfileRepository;

    @Mock
    private MentorshipRequestRepository mentorshipRequestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ResumeReviewRepository resumeReviewRepository;

    @Mock
    private ConversationRepository conversationRepository;

    @Mock
    private ChatService chatService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @Mock
    private Storage storage;

    @InjectMocks
    private MentorshipServiceImpl mentorshipService;

    @Mock
    private NotificationService notificationService;


    @BeforeEach
    void setUp() {
        // Replace the internal Storage field with our mock
        ReflectionTestUtils.setField(mentorshipService, "storage", storage);

        // Inject @Value fields used in methods we test
        ReflectionTestUtils.setField(mentorshipService, "gcsBucket", "test-bucket");
        ReflectionTestUtils.setField(mentorshipService, "gcsPublic", true);
        ReflectionTestUtils.setField(mentorshipService, "gcsPublicBaseUrl", "https://storage.googleapis.com");
        ReflectionTestUtils.setField(mentorshipService, "appEnv", "dev");
    }

    // ---------------------------------------------------------------------
    // uploadResumeFile
    // ---------------------------------------------------------------------

    @Test
    void uploadResumeFile_success_publicBucket() throws Exception {
        Long reviewId = 1L;

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("cv.pdf");
        when(file.getBytes()).thenReturn("dummy".getBytes());

        ResumeReview review = new ResumeReview();
        review.setId(reviewId);
        when(resumeReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        // storage.create just needs to succeed
        when(storage.create(any(BlobInfo.class), any(byte[].class))).thenReturn(mock(Blob.class));

        ResumeFileResponseDTO response =
                mentorshipService.uploadResumeFile(reviewId, file);

        String expectedObjectName = "dev/resumes/" + reviewId + ".pdf";
        String expectedUrl = "https://storage.googleapis.com/test-bucket/" + expectedObjectName;

        assertEquals(reviewId, response.getResumeReviewId());
        assertEquals(expectedUrl, response.getFileUrl());
        assertNotNull(response.getUploadedAt());

        verify(storage).create(any(BlobInfo.class), any(byte[].class));
    }

    @Test
    void uploadResumeFile_nullFile_throws() {
        HandleException ex = assertThrows(
                HandleException.class,
                () -> mentorshipService.uploadResumeFile(1L, null)
        );
        assertTrue(ex.getMessage().contains("Resume file is required"));
    }

    @Test
    void uploadResumeFile_invalidContentType_throws() {
        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("image/png");

        HandleException ex = assertThrows(
                HandleException.class,
                () -> mentorshipService.uploadResumeFile(1L, file)
        );
        assertTrue(ex.getMessage().contains("Only PDF files are allowed"));
    }

    @Test
    void uploadResumeFile_whenGetBytesFails_throws() throws Exception {
        Long reviewId = 1L;

        MultipartFile file = mock(MultipartFile.class);
        when(file.isEmpty()).thenReturn(false);
        when(file.getContentType()).thenReturn("application/pdf");
        when(file.getOriginalFilename()).thenReturn("cv.pdf");
        when(file.getBytes()).thenThrow(new IOException("boom"));

        when(resumeReviewRepository.findById(reviewId))
                .thenReturn(Optional.of(new ResumeReview()));

        HandleException ex = assertThrows(
                HandleException.class,
                () -> mentorshipService.uploadResumeFile(reviewId, file)
        );
        assertTrue(ex.getMessage().contains("Upload failed"));
    }

    // ---------------------------------------------------------------------
    // getResumeFileUrl
    // ---------------------------------------------------------------------

    @Test
    void getResumeFileUrl_reviewNotFound_throws() {
        when(resumeReviewRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(
                HandleException.class,
                () -> mentorshipService.getResumeFileUrl(1L)
        );
    }

    @Test
    void getResumeFileUrl_noFile_throws() {
        ResumeReview review = new ResumeReview();
        review.setId(1L);
        review.setResumeUrl(null);

        when(resumeReviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThrows(
                HandleException.class,
                () -> mentorshipService.getResumeFileUrl(1L)
        );
    }

    // ---------------------------------------------------------------------
    // createMentorProfile
    // ---------------------------------------------------------------------

    @Test
    void createMentorProfile_success() {
        Long userId = 10L;

        User user = new User();
        user.setId(userId);
        user.setUsername("mentorUser");

        CreateMentorProfileDTO dto = new CreateMentorProfileDTO(Collections.singletonList("Java"), 3);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(mentorProfileRepository.existsById(userId)).thenReturn(false);

        MentorProfile saved = new MentorProfile();
        saved.setId(userId);
        saved.setUser(user);
        saved.setExpertise( Collections.singletonList("Java"));
        saved.setMaxMentees(3);
        saved.setCurrentMentees(0);
        saved.setAverageRating(0.0f);
        saved.setReviewCount(0);

        when(mentorProfileRepository.save(any(MentorProfile.class))).thenReturn(saved);

        var result = mentorshipService.createMentorProfile(userId, dto);

        assertEquals(userId.toString(), result.id());
        assertEquals("mentorUser", result.username());
        assertEquals(Collections.singletonList("Java"), result.expertise());
        assertEquals(3, result.maxMentees());

        verify(mentorProfileRepository).save(any(MentorProfile.class));
    }

    @Test
    void createMentorProfile_userNotFound_throws() {
        when(userRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(
                HandleException.class,
                () -> mentorshipService.createMentorProfile(10L, new CreateMentorProfileDTO(Collections.singletonList("Java") , 3))
        );
    }

    @Test
    void createMentorProfile_alreadyExists_throws() {
        Long userId = 10L;
        when(userRepository.findById(userId)).thenReturn(Optional.of(new User()));
        when(mentorProfileRepository.existsById(userId)).thenReturn(true);

        assertThrows(
                HandleException.class,
                () -> mentorshipService.createMentorProfile(userId, new CreateMentorProfileDTO(Collections.singletonList("Java"), 3))
        );
    }

    // ---------------------------------------------------------------------
    // createMentorshipRequest
    // ---------------------------------------------------------------------

    @Test
    void createMentorshipRequest_success() {
        Long mentorId = 5L;
        Long jobSeekerId = 7L;
        String motivation = "I want to learn backend engineering.";

        MentorProfile mentor = mock(MentorProfile.class);
        when(mentor.getId()).thenReturn(mentorId);
        when(mentor.canAccept()).thenReturn(true);

        User jobSeeker = new User();
        jobSeeker.setId(jobSeekerId);

        when(mentorProfileRepository.findById(mentorId)).thenReturn(Optional.of(mentor));
        when(userRepository.findById(jobSeekerId)).thenReturn(Optional.of(jobSeeker));

        MentorshipRequest saved = new MentorshipRequest();
        saved.setId(1L);
        saved.setMentor(mentor);
        saved.setRequester(jobSeeker);
        saved.setStatus(RequestStatus.PENDING);
        saved.setCreatedAt(LocalDateTime.now());
        saved.setMotivation(motivation);

        when(mentorshipRequestRepository.save(any(MentorshipRequest.class))).thenReturn(saved);

        CreateMentorshipRequestDTO dto = new CreateMentorshipRequestDTO(mentorId, motivation);

        var result = mentorshipService.createMentorshipRequest(dto, jobSeekerId);

        assertEquals("1", result.id());
        assertEquals(jobSeekerId.toString(), result.requesterId());
        assertEquals(mentorId.toString(), result.mentorId());
        assertEquals(RequestStatus.PENDING.name(), result.status());
        assertEquals(motivation, result.motivation());

        ArgumentCaptor<MentorshipRequest> captor = ArgumentCaptor.forClass(MentorshipRequest.class);
        verify(mentorshipRequestRepository).save(captor.capture());

        MentorshipRequest toSave = captor.getValue();
        assertEquals(mentor, toSave.getMentor());
        assertEquals(jobSeeker, toSave.getRequester());
        assertEquals(RequestStatus.PENDING, toSave.getStatus());
        assertEquals(motivation, toSave.getMotivation());
        assertNotNull(toSave.getCreatedAt());

        verify(mentorProfileRepository).findById(mentorId);
        verify(userRepository).findById(jobSeekerId);
        verifyNoMoreInteractions(mentorProfileRepository, userRepository, mentorshipRequestRepository);
    }

    // ---------------------------------------------------------------------
    // respondToMentorshipRequest
    // ---------------------------------------------------------------------

    @Test
    void respondToMentorshipRequest_accept_success() {
        Long requestId = 1L;
        Long mentorUserId = 10L;

        User mentorUser = new User();
        mentorUser.setId(mentorUserId);

        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setId(mentorUserId);
        mentorProfile.setUser(mentorUser);
        mentorProfile.setCurrentMentees(0);
        mentorProfile.setMaxMentees(5);

        User requester = new User();
        requester.setId(20L);

        MentorshipRequest request = new MentorshipRequest();
        request.setId(requestId);
        request.setMentor(mentorProfile);
        request.setRequester(requester);
        request.setStatus(RequestStatus.PENDING);
        request.setMotivation("Please mentor me");
        request.setCreatedAt(LocalDateTime.now());

        when(mentorshipRequestRepository.findById(requestId))
                .thenReturn(Optional.of(request));

        when(resumeReviewRepository.save(any(ResumeReview.class)))
                .thenAnswer(invocation -> {
                    ResumeReview r = invocation.getArgument(0);
                    r.setId(100L);
                    return r;
                });

        Conversation conversation = new Conversation();
        conversation.setId(555L);
        when(chatService.createConversationForReview(any(ResumeReview.class)))
                .thenReturn(conversation);

        when(mentorshipRequestRepository.save(request)).thenReturn(request);

        when(mentorshipRequestRepository.save(any(MentorshipRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RespondToRequestDTO dto = new RespondToRequestDTO(true, "Happy to mentor you!");

        MentorshipRequestResponseDTO result =
                mentorshipService.respondToMentorshipRequest(requestId, dto, mentorUserId);

        assertEquals(RequestStatus.ACCEPTED.name(), result.status());
        assertEquals(requestId.toString(), result.id());
        assertEquals(requester.getId().toString(), result.requesterId());
        assertEquals(mentorProfile.getId().toString(), result.mentorId());

        ArgumentCaptor<MentorshipRequest> requestCaptor = ArgumentCaptor.forClass(MentorshipRequest.class);
        verify(mentorshipRequestRepository).save(requestCaptor.capture());

        MentorshipRequest savedRequest = requestCaptor.getValue();
        assertEquals(RequestStatus.ACCEPTED, savedRequest.getStatus());
        assertEquals("Happy to mentor you!", savedRequest.getResponseMessage());
        assertSame(mentorProfile, savedRequest.getMentor());
        assertSame(requester, savedRequest.getRequester());

        ArgumentCaptor<ResumeReview> reviewCaptor = ArgumentCaptor.forClass(ResumeReview.class);
        verify(resumeReviewRepository).save(reviewCaptor.capture());
        ResumeReview savedReview = reviewCaptor.getValue();


        assertSame(mentorProfile, savedReview.getMentor());
        assertSame(requester, savedReview.getJobSeeker());

        verify(chatService).createConversationForReview(savedReview);

        ArgumentCaptor<MentorProfile> mentorCaptor = ArgumentCaptor.forClass(MentorProfile.class);
        verify(mentorProfileRepository).save(mentorCaptor.capture());
        MentorProfile updatedMentor = mentorCaptor.getValue();
        assertEquals(1, updatedMentor.getCurrentMentees());

        verify(mentorshipRequestRepository).findById(requestId);
        verifyNoMoreInteractions(
                mentorshipRequestRepository,
                resumeReviewRepository,
                mentorProfileRepository,
                chatService
        );
    }

    @Test
    void respondToMentorshipRequest_decline_success() {
        Long requestId = 1L;
        Long mentorUserId = 10L;

        User mentorUser = new User();
        mentorUser.setId(mentorUserId);

        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setId(mentorUserId);
        mentorProfile.setUser(mentorUser);
        mentorProfile.setMaxMentees(5);
        mentorProfile.setCurrentMentees(0);

        User requester = new User();
        requester.setId(20L);

        MentorshipRequest request = new MentorshipRequest();
        request.setId(requestId);
        request.setMentor(mentorProfile);
        request.setRequester(requester);
        request.setStatus(RequestStatus.PENDING);
        request.setMotivation("Please mentor me");
        request.setCreatedAt(LocalDateTime.now());

        when(mentorshipRequestRepository.findById(requestId))
                .thenReturn(Optional.of(request));
        when(mentorshipRequestRepository.save(any(MentorshipRequest.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        RespondToRequestDTO dto =
                new RespondToRequestDTO(false, "Sorry, I don't have capacity right now.");

        MentorshipRequestResponseDTO result =
                mentorshipService.respondToMentorshipRequest(requestId, dto, mentorUserId);

        assertEquals(RequestStatus.DECLINED.name(), result.status());
        assertEquals(requestId.toString(), result.id());
        assertEquals(requester.getId().toString(), result.requesterId());
        assertEquals(mentorProfile.getId().toString(), result.mentorId());

        ArgumentCaptor<MentorshipRequest> requestCaptor = ArgumentCaptor.forClass(MentorshipRequest.class);
        verify(mentorshipRequestRepository).save(requestCaptor.capture());

        MentorshipRequest savedRequest = requestCaptor.getValue();
        assertEquals(RequestStatus.DECLINED, savedRequest.getStatus());
        assertEquals("Sorry, I don't have capacity right now.", savedRequest.getResponseMessage());
        assertSame(mentorProfile, savedRequest.getMentor());
        assertSame(requester, savedRequest.getRequester());

        verify(resumeReviewRepository, never()).save(any());
        verify(chatService, never()).createConversationForReview(any());
        verify(mentorProfileRepository, never()).save(any());

        verify(mentorshipRequestRepository).findById(requestId);
        verifyNoMoreInteractions(
                mentorshipRequestRepository,
                resumeReviewRepository,
                chatService,
                mentorProfileRepository
        );
    }

    @Test
    void respondToMentorshipRequest_unauthorizedMentor_throws() {
        Long requestId = 1L;
        Long realMentorUserId = 10L;
        Long otherUserId = 99L;

        User mentorUser = new User();
        mentorUser.setId(realMentorUserId);

        MentorProfile mentor = new MentorProfile();
        mentor.setId(5L);
        mentor.setUser(mentorUser);

        MentorshipRequest request = new MentorshipRequest();
        request.setId(requestId);
        request.setMentor(mentor);
        request.setStatus(RequestStatus.PENDING);

        when(mentorshipRequestRepository.findById(requestId)).thenReturn(Optional.of(request));

        RespondToRequestDTO dto =
                new RespondToRequestDTO(true, "Some message");

        HandleException ex = assertThrows(
                HandleException.class,
                () -> mentorshipService.respondToMentorshipRequest(requestId, dto, otherUserId)
        );

        verify(mentorshipRequestRepository).findById(requestId);
        verify(mentorshipRequestRepository, never()).save(any());
        verify(resumeReviewRepository, never()).save(any());
        verify(chatService, never()).createConversationForReview(any());
        verify(mentorProfileRepository, never()).save(any());
    }

    // ---------------------------------------------------------------------
    // completeMentorship
    // ---------------------------------------------------------------------

    @Test
    void completeMentorship_success_withConversation() {
        Long reviewId = 1L;
        Long userId = 50L;

        // Authentication + principal
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getId()).thenReturn(userId);
        when(auth.getPrincipal()).thenReturn(userDetails);

        // Review + mentorship request + users
        User jobSeeker = new User();
        jobSeeker.setId(userId);

        User mentorUser = new User();
        mentorUser.setId(100L);

        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setUser(mentorUser);
        mentorProfile.setCurrentMentees(1);

        MentorshipRequest request = new MentorshipRequest();
        request.setStatus(RequestStatus.PENDING);
        request.setMentor(mentorProfile);
        request.setRequester(jobSeeker);

        ResumeReview review = new ResumeReview();
        review.setId(reviewId);
        review.setJobSeeker(jobSeeker);
        review.setMentor(mentorProfile);
        review.setMentorshipRequest(request);
        review.setStatus(ReviewStatus.ACTIVE);

        when(resumeReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        Conversation conversation = new Conversation();
        conversation.setId(200L);
        when(conversationRepository.findByResumeReviewId(reviewId)).thenReturn(Optional.of(conversation));
        String expectedDestination = "/topic/conversation/" + conversation.getId();
        mentorshipService.completeMentorship(reviewId, auth);

        assertEquals(ReviewStatus.COMPLETED, review.getStatus());
        assertEquals(RequestStatus.COMPLETED, request.getStatus());
        assertEquals(0, mentorProfile.getCurrentMentees());

        verify(conversationRepository).save(conversation);
        verify(messagingTemplate).convertAndSend(
                eq(expectedDestination),
                any(ChatMessageDTO.class)
        );
        verify(resumeReviewRepository).save(review);
        verify(mentorshipRequestRepository).save(request);
        verify(mentorProfileRepository).save(mentorProfile);
    }

    @Test
    void completeMentorship_notActive_throws() {
        Long reviewId = 1L;
        Long userId = 50L;

        Authentication auth = mock(Authentication.class);
        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getId()).thenReturn(userId);
        when(auth.getPrincipal()).thenReturn(userDetails);

        User jobSeeker = new User();
        jobSeeker.setId(userId);

        User mentorUser = new User();
        mentorUser.setId(100L);

        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setUser(mentorUser);

        MentorshipRequest request = new MentorshipRequest();
        request.setMentor(mentorProfile);
        request.setRequester(jobSeeker);

        ResumeReview review = new ResumeReview();
        review.setId(reviewId);
        review.setJobSeeker(jobSeeker);
        review.setMentor(mentorProfile);
        review.setMentorshipRequest(request);
        review.setStatus(ReviewStatus.CLOSED);

        when(resumeReviewRepository.findById(reviewId)).thenReturn(Optional.of(review));

        assertThrows(
                HandleException.class,
                () -> mentorshipService.completeMentorship(reviewId, auth)
        );
    }
}
