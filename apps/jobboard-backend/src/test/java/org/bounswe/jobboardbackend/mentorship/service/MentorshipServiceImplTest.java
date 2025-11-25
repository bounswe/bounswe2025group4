package org.bounswe.jobboardbackend.mentorship.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.dto.ChatMessageDTO;
import org.bounswe.jobboardbackend.mentorship.dto.CreateMentorProfileDTO;
import org.bounswe.jobboardbackend.mentorship.dto.CreateMentorshipRequestDTO;
import org.bounswe.jobboardbackend.mentorship.dto.ResumeFileResponseDTO;
import org.bounswe.jobboardbackend.mentorship.model.*;
import org.bounswe.jobboardbackend.mentorship.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
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

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
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

        when(mentorshipRequestRepository.save(any(MentorshipRequest.class))).thenReturn(saved);

        CreateMentorshipRequestDTO dto = new CreateMentorshipRequestDTO(mentorId);

        var result = mentorshipService.createMentorshipRequest(dto, jobSeekerId);

        assertEquals("1", result.id());
        assertEquals(mentorId.toString(), result.mentorId());
        assertEquals(jobSeekerId.toString(), result.requesterId());
        assertEquals(RequestStatus.PENDING.name(), result.status());

        verify(mentorshipRequestRepository).save(any(MentorshipRequest.class));
    }

    // ---------------------------------------------------------------------
    // respondToMentorshipRequest
    // ---------------------------------------------------------------------

    @Test
    void respondToMentorshipRequest_accept_success() {
        Long requestId = 1L;
        Long mentorUserId = 10L;

        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setId(mentorUserId);
        mentorProfile.setCurrentMentees(0);
        mentorProfile.setUser(new User());

        User requester = new User();
        requester.setId(20L);

        MentorshipRequest request = new MentorshipRequest();
        request.setId(requestId);
        request.setMentor(mentorProfile);
        request.setRequester(requester);
        request.setStatus(RequestStatus.PENDING);

        when(mentorshipRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(resumeReviewRepository.save(any(ResumeReview.class)))
                .thenAnswer(invocation -> {
                    ResumeReview r = invocation.getArgument(0);
                    r.setId(100L);
                    return r;
                });
        when(mentorshipRequestRepository.save(request)).thenReturn(request);

        var result = mentorshipService.respondToMentorshipRequest(requestId, true, mentorUserId);

        assertEquals(RequestStatus.ACCEPTED.name(), result.status());
        verify(chatService).createConversationForReview(any(ResumeReview.class));
        verify(mentorProfileRepository).save(mentorProfile);
    }

    @Test
    void respondToMentorshipRequest_decline_success() {
        Long requestId = 1L;
        Long mentorUserId = 10L;

        MentorProfile mentorProfile = new MentorProfile();
        mentorProfile.setId(mentorUserId);
        mentorProfile.setUser(new User());

        User requester = new User();
        requester.setId(20L);

        MentorshipRequest request = new MentorshipRequest();
        request.setId(requestId);
        request.setMentor(mentorProfile);
        request.setRequester(requester);
        request.setStatus(RequestStatus.PENDING);

        when(mentorshipRequestRepository.findById(requestId)).thenReturn(Optional.of(request));
        when(mentorshipRequestRepository.save(request)).thenReturn(request);

        var result = mentorshipService.respondToMentorshipRequest(requestId, false, mentorUserId);

        assertEquals(RequestStatus.DECLINED.name(), result.status());
        verify(resumeReviewRepository, never()).save(any());
        verify(chatService, never()).createConversationForReview(any());
    }

    @Test
    void respondToMentorshipRequest_unauthorizedMentor_throws() {
        MentorshipRequest request = new MentorshipRequest();
        MentorProfile mentor = new MentorProfile();
        mentor.setId(10L);
        mentor.setUser(new User());
        request.setMentor(mentor);
        request.setStatus(RequestStatus.PENDING);

        when(mentorshipRequestRepository.findById(1L)).thenReturn(Optional.of(request));

        assertThrows(
                HandleException.class,
                () -> mentorshipService.respondToMentorshipRequest(1L, true, 99L)
        );
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
