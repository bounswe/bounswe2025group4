package org.bounswe.backend.mentor.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.bounswe.backend.mentor.dto.*;
import org.bounswe.backend.mentor.service.MentorService;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Mentorship", description = "Mentorship related endpoints")
public class MentorController {

    private final MentorService mentorService;
    private final UserRepository userRepository;

    public MentorController(MentorService mentorService, UserRepository userRepository) {
        this.mentorService = mentorService;
        this.userRepository = userRepository;
    }

    @PostMapping("/mentor/profile")
    public ResponseEntity<MentorProfileDto> createMentorProfile(@Valid @RequestBody CreateMentorProfileRequestDto dto) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.createMentorProfile(user.getId(), dto));
    }

    @GetMapping("/mentor/profile/{userId}")
    public ResponseEntity<MentorProfileDto> getMentorProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(mentorService.getMentorProfileByUserId(userId));
    }

    @GetMapping("/mentor/profiles")
    public ResponseEntity<List<MentorProfileDto>> getAllMentorProfiles() {
        return ResponseEntity.ok(mentorService.getAllMentorProfiles());
    }

    @PatchMapping("/mentor/profile/capacity")
    public ResponseEntity<MentorProfileDto> updateMentorCapacity(@RequestParam Integer capacity) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.updateMentorCapacity(user.getId(), capacity));
    }

    @PatchMapping("/mentor/profile/availability")
    public ResponseEntity<MentorProfileDto> updateMentorAvailability(@RequestParam Boolean isAvailable) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.updateMentorAvailability(user.getId(), isAvailable));
    }

    @PostMapping("/mentor/request")
    public ResponseEntity<MentorshipRequestDto> createMentorshipRequest(@Valid @RequestBody CreateMentorshipRequestDto dto) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.createMentorshipRequest(user.getId(), dto));
    }

    @GetMapping("/mentor/requests/mentor")
    public ResponseEntity<List<MentorshipRequestDto>> getMentorshipRequestsAsMentor() {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.getMentorshipRequestsByMentorId(user.getId()));
    }

    @GetMapping("/mentor/requests/mentee")
    public ResponseEntity<List<MentorshipRequestDto>> getMentorshipRequestsAsMentee() {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.getMentorshipRequestsByMenteeId(user.getId()));
    }

    @GetMapping("/mentor/request/{requestId}")
    public ResponseEntity<MentorshipRequestDto> getMentorshipRequest(@PathVariable Long requestId) {
        return ResponseEntity.ok(mentorService.getMentorshipRequestById(requestId));
    }

    @PatchMapping("/mentor/request/{requestId}/status")
    public ResponseEntity<MentorshipRequestDto> updateMentorshipRequestStatus(
            @PathVariable Long requestId,
            @Valid @RequestBody UpdateMentorshipRequestStatusDto dto) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.updateMentorshipRequestStatus(requestId, dto.getStatus(), user.getId()));
    }


    @PostMapping("/mentor/review")
    public ResponseEntity<MentorReviewDto> createMentorReview(@Valid @RequestBody CreateMentorReviewRequestDto dto) {
        User user = getCurrentUser();
        return ResponseEntity.ok(mentorService.createMentorReview(user.getId(), dto));
    }

    @GetMapping("/mentor/{mentorId}/reviews")
    public ResponseEntity<List<MentorReviewDto>> getMentorReviews(@PathVariable Long mentorId) {
        return ResponseEntity.ok(mentorService.getMentorReviewsByMentorId(mentorId));
    }

    @GetMapping("/mentor/review/{reviewId}")
    public ResponseEntity<MentorReviewDto> getMentorReview(@PathVariable Long reviewId) {
        return ResponseEntity.ok(mentorService.getMentorReviewById(reviewId));
    }

    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new RuntimeException("Invalid authentication context");
    }
}
