package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Data Transfer Object for mentorship request details")
public record MentorshipRequestDTO(
                @Schema(description = "Unique ID of the request", example = "50") String id,

                @Schema(description = "ID of the requester (mentee)", example = "5") String requesterId,

                @Schema(description = "ID of the mentor", example = "10") String mentorId,

                @Schema(description = "Status of the request", example = "PENDING") String status,

                @Schema(description = "Timestamp when the request was created") LocalDateTime createdAt,

                @Schema(description = "Motivation message sent by the requester", example = "I would like to learn...") String motivation) {
}
