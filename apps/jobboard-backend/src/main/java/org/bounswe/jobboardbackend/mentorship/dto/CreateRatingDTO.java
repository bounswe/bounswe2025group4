package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for rating a mentor")
public record CreateRatingDTO(
                @NotNull @Schema(description = "ID of the resume review session associated with this rating", example = "100") Long resumeReviewId,

                @Min(1) @Max(5) @Schema(description = "Rating value (1-5)", example = "5") float rating,

                @Schema(description = "Review comment", example = "Great mentor, very helpful feedback.") String comment) {
}