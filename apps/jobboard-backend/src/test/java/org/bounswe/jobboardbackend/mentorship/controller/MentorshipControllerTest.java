package org.bounswe.jobboardbackend.mentorship.controller;

import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.mentorship.dto.*;
import org.bounswe.jobboardbackend.mentorship.service.MentorshipService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class MentorshipControllerTest {

    @Mock
    private MentorshipService mentorshipService;

    @InjectMocks
    private MentorshipController mentorshipController;

    // ----------------------------------------------------------------------
    // File upload / resume endpoints
    // ----------------------------------------------------------------------

    @Test
    void uploadResumeFile_returnsOkAndDelegatesToService() {
        Long resumeReviewId = 1L;
        MultipartFile file = mock(MultipartFile.class);
        ResumeFileResponseDTO responseDto = mock(ResumeFileResponseDTO.class);

        when(mentorshipService.uploadResumeFile(resumeReviewId, file))
                .thenReturn(responseDto);

        ResponseEntity<ResumeFileResponseDTO> response =
                mentorshipController.uploadResumeFile(resumeReviewId, file);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(responseDto, response.getBody());
        verify(mentorshipService).uploadResumeFile(resumeReviewId, file);
    }

    @Test
    void getResumeFileUrl_returnsOkAndBody() {
        Long resumeReviewId = 2L;
        ResumeFileUrlDTO dto = mock(ResumeFileUrlDTO.class);

        when(mentorshipService.getResumeFileUrl(resumeReviewId))
                .thenReturn(dto);

        ResponseEntity<ResumeFileUrlDTO> response =
                mentorshipController.getResumeFileUrl(resumeReviewId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(dto, response.getBody());
        verify(mentorshipService).getResumeFileUrl(resumeReviewId);
    }

    @Test
    void getResumeReview_returnsOkAndBody() {
        Long resumeReviewId = 3L;
        ResumeReviewDTO dto = mock(ResumeReviewDTO.class);

        when(mentorshipService.getResumeReview(resumeReviewId))
                .thenReturn(dto);

        ResponseEntity<ResumeReviewDTO> response =
                mentorshipController.getResumeReview(resumeReviewId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(dto, response.getBody());
        verify(mentorshipService).getResumeReview(resumeReviewId);
    }

    // ----------------------------------------------------------------------
    // Mentor search / profile endpoints
    // ----------------------------------------------------------------------

    @Test
    void searchMentors_returnsListFromService() {
        List<MentorProfileDetailDTO> mentors = List.of(
                mock(MentorProfileDetailDTO.class),
                mock(MentorProfileDetailDTO.class)
        );

        when(mentorshipService.searchMentors()).thenReturn(mentors);

        ResponseEntity<List<MentorProfileDetailDTO>> response =
                mentorshipController.searchMentors();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(mentors, response.getBody());
        verify(mentorshipService).searchMentors();
    }

    @Test
    void createMentorProfile_usesAuthenticatedUserId() {
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = mock(UserDetailsImpl.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(principal.getId()).thenReturn(10L);

        CreateMentorProfileDTO createDTO = mock(CreateMentorProfileDTO.class);
        MentorProfileDTO returned = mock(MentorProfileDTO.class);

        when(mentorshipService.createMentorProfile(10L, createDTO))
                .thenReturn(returned);

        ResponseEntity<MentorProfileDTO> response =
                mentorshipController.createMentorProfile(createDTO, auth);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(returned, response.getBody());
        verify(mentorshipService).createMentorProfile(10L, createDTO);
    }

    @Test
    void updateMentorProfile_callsServiceWithPathVariable() {
        Long userId = 5L;
        UpdateMentorProfileDTO updateDTO = mock(UpdateMentorProfileDTO.class);
        MentorProfileDTO returned = mock(MentorProfileDTO.class);

        when(mentorshipService.updateMentorProfile(userId, updateDTO))
                .thenReturn(returned);

        ResponseEntity<MentorProfileDTO> response =
                mentorshipController.updateMentorProfile(updateDTO, userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(returned, response.getBody());
        verify(mentorshipService).updateMentorProfile(userId, updateDTO);
    }

    @Test
    void getMentorProfile_returnsProfile() {
        Long userId = 5L;
        MentorProfileDetailDTO dto = mock(MentorProfileDetailDTO.class);

        when(mentorshipService.getMentorProfile(userId))
                .thenReturn(dto);

        ResponseEntity<MentorProfileDetailDTO> response =
                mentorshipController.getMentorProfile(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(dto, response.getBody());
        verify(mentorshipService).getMentorProfile(userId);
    }

    @Test
    void deleteMentorProfile_returnsOkAndCallsService() {
        Long userId = 6L;

        ResponseEntity<MentorProfileDTO> response =
                mentorshipController.deleteMentorProfile(userId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody());
        verify(mentorshipService).deleteMentorProfile(userId);
    }

    // ----------------------------------------------------------------------
    // Complete / close mentorship
    // ----------------------------------------------------------------------

    @Test
    void completeMentorship_callsServiceAndReturnsOk() {
        Long reviewId = 7L;
        Authentication auth = mock(Authentication.class);

        ResponseEntity<Void> response =
                mentorshipController.completeMentorship(reviewId, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(mentorshipService).completeMentorship(reviewId, auth);
    }

    @Test
    void closeMentorship_callsServiceAndReturnsOk() {
        Long reviewId = 8L;
        Authentication auth = mock(Authentication.class);

        ResponseEntity<Void> response =
                mentorshipController.closeMentorship(reviewId, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(mentorshipService).closeMentorship(reviewId, auth);
    }

    // ----------------------------------------------------------------------
    // Mentorship request endpoints
    // ----------------------------------------------------------------------

    @Test
    void createMentorshipRequest_usesAuthenticatedUserId() {
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = mock(UserDetailsImpl.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(principal.getId()).thenReturn(20L);

        CreateMentorshipRequestDTO requestDTO = mock(CreateMentorshipRequestDTO.class);
        MentorshipRequestDTO returned = mock(MentorshipRequestDTO.class);

        when(mentorshipService.createMentorshipRequest(requestDTO, 20L))
                .thenReturn(returned);

        ResponseEntity<MentorshipRequestDTO> response =
                mentorshipController.createMentorshipRequest(requestDTO, auth);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(returned, response.getBody());
        verify(mentorshipService).createMentorshipRequest(requestDTO, 20L);
    }

    @Test
    void getMentorshipRequestOfMentor_usesAuthenticatedUserId() {
        Long mentorId = 30L;
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = mock(UserDetailsImpl.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(principal.getId()).thenReturn(30L);

        List<MentorshipRequestDTO> requests = List.of(mock(MentorshipRequestDTO.class));

        when(mentorshipService.getMentorshipRequestsOfMentor(mentorId, 30L))
                .thenReturn(requests);

        ResponseEntity<List<MentorshipRequestDTO>> response =
                mentorshipController.getMentorshipRequestOfMentor(mentorId, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(requests, response.getBody());
        verify(mentorshipService).getMentorshipRequestsOfMentor(mentorId, 30L);
    }

    @Test
    void getMyMentorshipDetails_forMenteeReturnsList() {
        Long menteeId = 40L;
        List<MentorshipDetailsDTO> details = List.of(mock(MentorshipDetailsDTO.class));

        when(mentorshipService.getMentorshipDetailsForMentee(menteeId, menteeId))
                .thenReturn(details);

        ResponseEntity<List<MentorshipDetailsDTO>> response =
                mentorshipController.getMyMentorshipDetails(menteeId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(details, response.getBody());
        verify(mentorshipService).getMentorshipDetailsForMentee(menteeId, menteeId);
    }

    @Test
    void getMentorshipRequest_usesAuthenticatedUserId() {
        Long requestId = 50L;
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = mock(UserDetailsImpl.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(principal.getId()).thenReturn(99L);

        MentorshipRequestDTO dto = new MentorshipRequestDTO(
                "50",
                "10",
                "99",
                "PENDING",
                LocalDateTime.now(),
                "Because I want to learn"
        );

        when(mentorshipService.getMentorshipRequest(requestId, 99L))
                .thenReturn(dto);

        ResponseEntity<MentorshipRequestDTO> response =
                mentorshipController.getMentorshipRequest(requestId, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(dto, response.getBody());

        verify(mentorshipService).getMentorshipRequest(requestId, 99L);
        verifyNoMoreInteractions(mentorshipService);
    }


    @Test
    void respondToMentorshipRequest_usesAuthenticatedUserIdAndDelegatesToService() {
        Long requestId = 60L;

        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = mock(UserDetailsImpl.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(principal.getId()).thenReturn(11L);

        RespondToRequestDTO dto =
                new RespondToRequestDTO(true, "Happy to mentor you.");

        MentorshipRequestResponseDTO serviceResult = mock(MentorshipRequestResponseDTO.class);
        when(mentorshipService.respondToMentorshipRequest(requestId, dto, 11L))
                .thenReturn(serviceResult);

        ResponseEntity<MentorshipRequestResponseDTO> response =
                mentorshipController.respondToMentorshipRequest(requestId, dto, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertSame(serviceResult, response.getBody());

        verify(mentorshipService).respondToMentorshipRequest(requestId, dto, 11L);
        verifyNoMoreInteractions(mentorshipService);
    }


    // ----------------------------------------------------------------------
    // Rating endpoint
    // ----------------------------------------------------------------------

    @Test
    void rateMentor_usesAuthenticatedJobSeekerId() {
        Authentication auth = mock(Authentication.class);
        UserDetailsImpl principal = mock(UserDetailsImpl.class);
        when(auth.getPrincipal()).thenReturn(principal);
        when(principal.getId()).thenReturn(77L);

        CreateRatingDTO ratingDTO = mock(CreateRatingDTO.class);

        ResponseEntity<Void> response =
                mentorshipController.rateMentor(ratingDTO, auth);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        verify(mentorshipService).rateMentor(ratingDTO, 77L);
    }
}
