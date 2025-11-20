package org.bounswe.jobboardbackend.mentorship.dto;
import java.time.LocalDateTime;

public record MentorReviewDTO(
        Long id,
        String reviewerUsername,
        float rating,
        String comment,
        LocalDateTime createdAt
) {}