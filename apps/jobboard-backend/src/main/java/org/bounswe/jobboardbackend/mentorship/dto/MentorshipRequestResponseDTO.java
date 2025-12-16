package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Data Transfer Object for mentorship request response details")
public record MentorshipRequestResponseDTO(
                @Schema(description = "Unique ID of the request", example = "50") String id,

                @Schema(description = "ID of the requester", example = "5") String requesterId,

                @Schema(description = "ID of the mentor", example = "10") String mentorId,

                @Schema(description = "Current status of the request", example = "ACCEPTED") String status,

                @Schema(description = "Timestamp when the request was created") LocalDateTime createdAt,

                @Schema(description = "Motivation message", example = "Please mentor me.") String motivation,

                @Schema(description = "Response message from the mentor", example = "I'd be happy to help.") String responseMessage) {
}
