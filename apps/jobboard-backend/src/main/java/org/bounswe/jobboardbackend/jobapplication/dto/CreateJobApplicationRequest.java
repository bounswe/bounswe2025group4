package org.bounswe.jobboardbackend.jobapplication.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for creating a new job application")
public class CreateJobApplicationRequest {

    @NotNull(message = "Job post ID is required")
    @Schema(description = "ID of the job post applying for", example = "10")
    private Long jobPostId;

    @Size(max = 500)
    @Schema(description = "Disabilities or special needs (optional)", example = "Remote work preferred due to mobility issues")
    private String specialNeeds; // Optional: disabilities or special needs

    @Size(max = 2000, message = "Cover letter must not exceed 2000 characters")
    @Schema(description = "Cover letter or motivation letter (optional)", example = "I am excited to apply...")
    private String coverLetter; // Optional: Cover letter / motivation letter
}
