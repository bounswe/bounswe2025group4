package org.bounswe.jobboardbackend.mentorship.dto;

import java.time.LocalDateTime;

public record MentorshipRequestDTO(
        String id,
        String requesterId,
        String mentorId,
        String status,
        LocalDateTime createdAt
) {}
