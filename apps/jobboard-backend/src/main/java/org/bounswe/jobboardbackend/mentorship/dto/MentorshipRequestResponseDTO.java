package org.bounswe.jobboardbackend.mentorship.dto;

import java.time.LocalDateTime;

public record MentorshipRequestResponseDTO(
        String id,
        String requesterId,
        String mentorId,
        String status,
        LocalDateTime createdAt,
        String motivation,
        String responseMessage
) {}
