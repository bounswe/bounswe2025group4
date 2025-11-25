package org.bounswe.jobboardbackend.mentorship.dto;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record CreateRatingDTO(
        @NotNull Long resumeReviewId,
        @Min(1) @Max(5) float rating,
        String comment
) {}