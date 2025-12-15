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
@Schema(description = "Request object for updating a review")
public class ReviewUpdateRequest {
    @Schema(description = "Updated title", example = "Updated Title")
    @Size(max = 255)
    private String title;

    @Schema(description = "Updated content", example = "Updated content...")
    @Size(max = 4000)
    private String content;

    @Schema(description = "Updated ethical policy ratings")
    private Map<String, @Min(1) @Max(5) Integer> ethicalPolicyRatings; // policy -> 1..5

    @Schema(description = "Update anonymity status")
    private Boolean isAnonymous; // optional
}