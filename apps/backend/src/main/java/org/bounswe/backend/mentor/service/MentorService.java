package org.bounswe.backend.mentor.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.backend.mentor.dto.*;
import org.bounswe.backend.mentor.entity.MentorProfile;
import org.bounswe.backend.mentor.entity.MentorReview;
import org.bounswe.backend.mentor.entity.MentorshipRequest;
import org.bounswe.backend.common.enums.MentorshipRequestStatus;
import org.bounswe.backend.mentor.repository.MentorProfileRepository;
import org.bounswe.backend.mentor.repository.MentorReviewRepository;
import org.bounswe.backend.mentor.repository.MentorshipRequestRepository;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MentorService {

    private final MentorProfileRepository mentorProfileRepository;
    private final MentorshipRequestRepository mentorshipRequestRepository;
    private final MentorReviewRepository mentorReviewRepository;
    private final UserRepository userRepository;

    @Transactional
    public MentorProfileDto createMentorProfile(Long userId, CreateMentorProfileRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (mentorProfileRepository.existsByUserId(userId)) {
            throw new RuntimeException("Mentor profile already exists for this user");
        }

        MentorProfile mentorProfile = MentorProfile.builder()
                .user(user)
                .capacity(dto.getCapacity())
                .currentMenteeCount(0)
                .averageRating(0.0)
                .reviewCount(0)
                .isAvailable(dto.getIsAvailable())
                .build();

        MentorProfile savedProfile = mentorProfileRepository.save(mentorProfile);
        return mapToMentorProfileDto(savedProfile);
    }

    public MentorProfileDto getMentorProfileByUserId(Long userId) {
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));
        return mapToMentorProfileDto(mentorProfile);
    }

    public List<MentorProfileDto> getAllMentorProfiles() {
        return mentorProfileRepository.findAll().stream()
                .map(this::mapToMentorProfileDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MentorProfileDto updateMentorCapacity(Long userId, Integer capacity) {
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        mentorProfile.setCapacity(capacity);
        MentorProfile updatedProfile = mentorProfileRepository.save(mentorProfile);
        return mapToMentorProfileDto(updatedProfile);
    }

    @Transactional
    public MentorProfileDto updateMentorAvailability(Long userId, Boolean isAvailable) {
        MentorProfile mentorProfile = mentorProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        mentorProfile.setIsAvailable(isAvailable);
        MentorProfile updatedProfile = mentorProfileRepository.save(mentorProfile);
        return mapToMentorProfileDto(updatedProfile);
    }

    @Transactional
    public MentorshipRequestDto createMentorshipRequest(Long menteeId, CreateMentorshipRequestDto dto) {
        User mentee = userRepository.findById(menteeId)
                .orElseThrow(() -> new RuntimeException("Mentee not found"));

        // Find the mentor profile first, then get the associated user
        MentorProfile mentorProfile = mentorProfileRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        User mentor = mentorProfile.getUser();

        if (!mentorProfile.getIsAvailable()) {
            throw new RuntimeException("Mentor is not available for mentorship");
        }

        if (mentorProfile.getCurrentMenteeCount() >= mentorProfile.getCapacity()) {
            throw new RuntimeException("Mentor has reached maximum capacity");
        }

        // Check if there's already an active request
        mentorshipRequestRepository.findByMentorAndMenteeAndStatus(mentor, mentee, MentorshipRequestStatus.PENDING)
                .ifPresent(request -> {
                    throw new RuntimeException("A pending request already exists");
                });

        MentorshipRequest request = MentorshipRequest.builder()
                .mentor(mentor)
                .mentee(mentee)
                .message(dto.getMessage())
                .status(MentorshipRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .build();

        MentorshipRequest savedRequest = mentorshipRequestRepository.save(request);
        return mapToMentorshipRequestDto(savedRequest);
    }

    public List<MentorshipRequestDto> getMentorshipRequestsByMentorId(Long mentorId) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        return mentorshipRequestRepository.findByMentor(mentor).stream()
                .map(this::mapToMentorshipRequestDto)
                .collect(Collectors.toList());
    }

    public List<MentorshipRequestDto> getMentorshipRequestsByMenteeId(Long menteeId) {
        User mentee = userRepository.findById(menteeId)
                .orElseThrow(() -> new RuntimeException("Mentee not found"));

        return mentorshipRequestRepository.findByMentee(mentee).stream()
                .map(this::mapToMentorshipRequestDto)
                .collect(Collectors.toList());
    }

    public MentorshipRequestDto getMentorshipRequestById(Long requestId) {
        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Mentorship request not found"));

        return mapToMentorshipRequestDto(request);
    }

    @Transactional
    public MentorshipRequestDto updateMentorshipRequestStatus(Long requestId, MentorshipRequestStatus status, Long userId) {
        MentorshipRequest request = mentorshipRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Mentorship request not found"));

        // Check if the user has permission to update the status
        if (!request.getMentor().getId().equals(userId) && !request.getMentee().getId().equals(userId)) {
            throw new RuntimeException("You don't have permission to update this request");
        }

        // Additional validation based on status and user role
        if (status == MentorshipRequestStatus.ACCEPTED || status == MentorshipRequestStatus.REJECTED) {
            // Only mentor can accept or reject
            if (!request.getMentor().getId().equals(userId)) {
                throw new RuntimeException("Only the mentor can accept or reject requests");
            }
        } else if (status == MentorshipRequestStatus.CANCELLED) {
            // Only mentee can cancel
            if (!request.getMentee().getId().equals(userId)) {
                throw new RuntimeException("Only the mentee can cancel requests");
            }
        } else if (status == MentorshipRequestStatus.COMPLETED) {
            // Both mentor and mentee can mark as completed, but only if the request is currently ACCEPTED
            if (request.getStatus() != MentorshipRequestStatus.ACCEPTED) {
                throw new RuntimeException("Only accepted mentorships can be marked as completed");
            }
        }

        MentorProfile mentorProfile = mentorProfileRepository.findByUser(request.getMentor())
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        // If accepting a request, check capacity and create a channel
        if (status == MentorshipRequestStatus.ACCEPTED && request.getStatus() != MentorshipRequestStatus.ACCEPTED) {
            if (mentorProfile.getCurrentMenteeCount() >= mentorProfile.getCapacity()) {
                throw new RuntimeException("Mentor has reached maximum capacity");
            }

            // Increment current mentee count
            mentorProfile.setCurrentMenteeCount(mentorProfile.getCurrentMenteeCount() + 1);
            mentorProfileRepository.save(mentorProfile);

            // Create a channel ID for direct messaging
            request.setChannelId(UUID.randomUUID().toString());
        }

        // If completing or rejecting a previously accepted request, decrement count
        if ((status == MentorshipRequestStatus.COMPLETED || status == MentorshipRequestStatus.REJECTED) 
                && request.getStatus() == MentorshipRequestStatus.ACCEPTED) {
            mentorProfile.setCurrentMenteeCount(Math.max(0, mentorProfile.getCurrentMenteeCount() - 1));
            mentorProfileRepository.save(mentorProfile);
        }

        request.setStatus(status);
        request.setUpdatedAt(LocalDateTime.now());

        MentorshipRequest updatedRequest = mentorshipRequestRepository.save(request);
        return mapToMentorshipRequestDto(updatedRequest);
    }

    @Transactional
    public MentorReviewDto createMentorReview(Long menteeId, CreateMentorReviewRequestDto dto) {
        User mentee = userRepository.findById(menteeId)
                .orElseThrow(() -> new RuntimeException("Mentee not found"));

        User mentor = userRepository.findById(dto.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        // Check if there was an accepted mentorship between these users
        boolean hadMentorship = mentorshipRequestRepository.findByMentorAndMenteeAndStatus(
                mentor, mentee, MentorshipRequestStatus.COMPLETED).isPresent();

        if (!hadMentorship) {
            throw new RuntimeException("Cannot review a mentor without completing a mentorship");
        }

        // Check if already reviewed
        mentorReviewRepository.findByMentorAndMentee(mentor, mentee)
                .ifPresent(review -> {
                    throw new RuntimeException("You have already reviewed this mentor");
                });

        MentorReview review = MentorReview.builder()
                .mentor(mentor)
                .mentee(mentee)
                .rating(dto.getRating())
                .comment(dto.getComment())
                .createdAt(LocalDateTime.now())
                .build();

        MentorReview savedReview = mentorReviewRepository.save(review);

        // Update mentor's average rating
        updateMentorRating(mentor);

        return mapToMentorReviewDto(savedReview);
    }

    public List<MentorReviewDto> getMentorReviewsByMentorId(Long mentorId) {
        User mentor = userRepository.findById(mentorId)
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        return mentorReviewRepository.findByMentor(mentor).stream()
                .map(this::mapToMentorReviewDto)
                .collect(Collectors.toList());
    }

    public MentorReviewDto getMentorReviewById(Long reviewId) {
        MentorReview review = mentorReviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        return mapToMentorReviewDto(review);
    }

    private void updateMentorRating(User mentor) {
        Double averageRating = mentorReviewRepository.calculateAverageRatingByMentor(mentor);
        Integer reviewCount = mentorReviewRepository.countByMentor(mentor);

        if (averageRating == null) {
            averageRating = 0.0;
        }

        MentorProfile mentorProfile = mentorProfileRepository.findByUser(mentor)
                .orElseThrow(() -> new RuntimeException("Mentor profile not found"));

        mentorProfile.setAverageRating(averageRating);
        mentorProfile.setReviewCount(reviewCount);

        mentorProfileRepository.save(mentorProfile);
    }

    private MentorProfileDto mapToMentorProfileDto(MentorProfile mentorProfile) {
        return MentorProfileDto.builder()
                .id(mentorProfile.getId())
                .user(mapToUserDto(mentorProfile.getUser()))
                .capacity(mentorProfile.getCapacity())
                .currentMenteeCount(mentorProfile.getCurrentMenteeCount())
                .averageRating(mentorProfile.getAverageRating())
                .reviewCount(mentorProfile.getReviewCount())
                .isAvailable(mentorProfile.getIsAvailable())
                .build();
    }

    private MentorshipRequestDto mapToMentorshipRequestDto(MentorshipRequest request) {
        return MentorshipRequestDto.builder()
                .id(request.getId())
                .mentor(mapToUserDto(request.getMentor()))
                .mentee(mapToUserDto(request.getMentee()))
                .message(request.getMessage())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .channelId(request.getChannelId())
                .build();
    }

    private MentorReviewDto mapToMentorReviewDto(MentorReview review) {
        return MentorReviewDto.builder()
                .id(review.getId())
                .mentor(mapToUserDto(review.getMentor()))
                .mentee(mapToUserDto(review.getMentee()))
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    private UserDto mapToUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .bio(user.getBio())
                .userType(user.getUserType())
                .build();
    }
}
