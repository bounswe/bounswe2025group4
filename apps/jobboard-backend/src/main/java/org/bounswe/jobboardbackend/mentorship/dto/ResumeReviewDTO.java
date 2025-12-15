package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.jobboardbackend.mentorship.model.ReviewStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Data Transfer Object for resume review details")
public class ResumeReviewDTO {

    @Schema(description = "Unique ID of the resume review", example = "100")
    private Long resumeReviewId;

    @Schema(description = "URL of the resume file", example = "https://storage.example.com/resumes/123.pdf")
    private String fileUrl;

    @Schema(description = "Current status of the review", example = "IN_PROGRESS")
    private ReviewStatus reviewStatus;

    @Schema(description = "Feedback provided by the mentor", example = "Good structure, but add more details on projects.")
    private String feedback;
}
