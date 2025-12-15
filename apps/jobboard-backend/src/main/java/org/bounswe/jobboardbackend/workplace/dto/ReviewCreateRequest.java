package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating a review")
public class ReviewCreateRequest {
    @Schema(description = "Title of the review", example = "Great work environment")
    @Size(max = 255)
    private String title;

    @Schema(description = "Detailed content of the review", example = "The team is very supportive and I learned a lot.")
    @Size(max = 4000)
    private String content;

    @Schema(description = "Ratings for ethical policies (1-5)", example = "{\"Sustainability\": 5, \"Diversity\": 4}")
    private Map<String, @Min(1) @Max(5) Integer> ethicalPolicyRatings; // policy -> 1..5

    @Schema(description = "Whether the review should be anonymous", example = "false")
    private boolean isAnonymous;
}