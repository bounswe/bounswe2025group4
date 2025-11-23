package org.bounswe.jobboardbackend.mentorship.controller;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.mentorship.dto.*;
import org.bounswe.jobboardbackend.mentorship.service.MentorshipService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/mentorship")
@PreAuthorize("isAuthenticated()")
public class MentorshipController {

    private final MentorshipService mentorshipService;

    @PostMapping("/{resumeReviewId}/file")
    public ResponseEntity<ResumeFileResponseDTO> uploadResumeFile(
            @PathVariable Long resumeReviewId,
            @RequestPart("file") MultipartFile file
    ) {
        ResumeFileResponseDTO dto = mentorshipService.uploadResumeFile(resumeReviewId, file);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{resumeReviewId}/file")
    public ResponseEntity<ResumeFileUrlDTO> getResumeFileUrl(
            @PathVariable Long resumeReviewId
    ) {
        ResumeFileUrlDTO dto = mentorshipService.getResumeFileUrl(resumeReviewId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{resumeReviewId}")
    public ResponseEntity<ResumeReviewDTO> getResumeReview(
            @PathVariable Long resumeReviewId
    ) {
        ResumeReviewDTO dto = mentorshipService.getResumeReview(resumeReviewId);
        return ResponseEntity.ok(dto);
    }


    @GetMapping
    public ResponseEntity<List<MentorProfileDetailDTO>> searchMentors() {
        List<MentorProfileDetailDTO> mentors = mentorshipService.searchMentors();
        return ResponseEntity.ok(mentors);
    }

    @PostMapping("/mentor")
    public ResponseEntity<MentorProfileDTO> createMentorProfile(
            @Valid @RequestBody CreateMentorProfileDTO createDTO,
            Authentication auth
    ) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        MentorProfileDTO newProfile = mentorshipService.createMentorProfile(userDetails.getId(), createDTO);
        return new ResponseEntity<>(newProfile, HttpStatus.CREATED);
    }

    @PutMapping("/mentor/{userId}")
    public ResponseEntity<MentorProfileDTO> updateMentorProfile(
            @Valid @RequestBody UpdateMentorProfileDTO updateDTO,
            @PathVariable Long userId
    ) {
        MentorProfileDTO newProfile = mentorshipService.updateMentorProfile(userId, updateDTO);
        return new ResponseEntity<>(newProfile, HttpStatus.OK);
    }

    @GetMapping("/mentor/{userId}")
    public ResponseEntity<MentorProfileDetailDTO> getMentorProfile(
            @PathVariable Long userId
    ) {
        MentorProfileDetailDTO profile = mentorshipService.getMentorProfile(userId);
        return new ResponseEntity<>(profile, HttpStatus.OK);
    }

    @DeleteMapping("/mentor/{userId}")
    public ResponseEntity<MentorProfileDTO> deleteMentorProfile(
            @PathVariable Long userId
    ) {
        mentorshipService.deleteMentorProfile(userId);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/review/{resumeReviewId}/complete")
    public ResponseEntity<Void> completeMentorship(
            @PathVariable Long resumeReviewId,
            Authentication auth
    ) {
        mentorshipService.completeMentorship(resumeReviewId, auth);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/review/{resumeReviewId}/close")
    public ResponseEntity<Void> closeMentorship(
            @PathVariable Long resumeReviewId,
            Authentication auth
    ) {
        mentorshipService.closeMentorship(resumeReviewId, auth);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/requests")
    public ResponseEntity<MentorshipRequestDTO> createMentorshipRequest(
            @Valid @RequestBody CreateMentorshipRequestDTO requestDTO,
            Authentication auth
    ) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        MentorshipRequestDTO newRequest = mentorshipService.createMentorshipRequest(requestDTO, userDetails.getId());
        return new ResponseEntity<>(newRequest, HttpStatus.CREATED);
    }

    @GetMapping("mentor/{mentorId}/requests")
    public ResponseEntity<List<MentorshipRequestDTO>> getMentorshipRequestOfMentor(
            @PathVariable Long mentorId,
            Authentication auth
    ) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        List<MentorshipRequestDTO> requests = mentorshipService.getMentorshipRequestsOfMentor(mentorId, userDetails.getId());
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/mentee/{menteeId}/requests")
    public ResponseEntity<List<MentorshipDetailsDTO>> getMyMentorshipDetails(
            @PathVariable Long menteeId
    ) {
        List<MentorshipDetailsDTO> details = mentorshipService.getMentorshipDetailsForMentee(menteeId, menteeId);
        return ResponseEntity.ok(details);
    }


    @GetMapping("/requests/{requestId}")
    public ResponseEntity<MentorshipRequestDTO> getMentorshipRequest(
            @PathVariable Long requestId,
            Authentication auth
    ) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        MentorshipRequestDTO request = mentorshipService.getMentorshipRequest(requestId, userDetails.getId());
        return new ResponseEntity<>(request, HttpStatus.OK);
    }


    @PatchMapping("/requests/{requestId}/respond")
    public ResponseEntity<MentorshipRequestDTO> respondToMentorshipRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody RespondToRequestDTO responseDTO,
            Authentication auth
    ) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        MentorshipRequestDTO updatedRequest = mentorshipService.respondToMentorshipRequest(
                requestId,
                responseDTO.accept(),
                userDetails.getId()
        );
        return new ResponseEntity<>(updatedRequest, HttpStatus.OK);
    }


    @PostMapping("/ratings")
    public ResponseEntity<Void> rateMentor(
            @Valid @RequestBody CreateRatingDTO ratingDTO,
            Authentication auth
    ) {
        UserDetailsImpl jobSeeker = (UserDetailsImpl) auth.getPrincipal();
        mentorshipService.rateMentor(ratingDTO, jobSeeker.getId());

        return new ResponseEntity<>(HttpStatus.CREATED);
    }
}
