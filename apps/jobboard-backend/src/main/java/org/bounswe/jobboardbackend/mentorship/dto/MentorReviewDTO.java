package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Data Transfer Object for a review given to a mentor")
public record MentorReviewDTO(
                @Schema(description = "ID of the review", example = "5") Long id,

                @Schema(description = "Username of the reviewer (mentee)", example = "mentee_john") String reviewerUsername,

                @Schema(description = "Rating given (1-5)", example = "5") float rating,

                @Schema(description = "Review comment", example = "Excellent guidance.") String comment,

                @Schema(description = "Timestamp when the review was created") LocalDateTime createdAt) {
}