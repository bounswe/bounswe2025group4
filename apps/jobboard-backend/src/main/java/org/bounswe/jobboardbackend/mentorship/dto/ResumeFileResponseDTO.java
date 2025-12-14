package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.jobboardbackend.mentorship.model.ReviewStatus;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Schema(description = "Response object for resume file upload")
public class ResumeFileResponseDTO {

    @Schema(description = "ID of the resume review session", example = "100")
    private Long resumeReviewId;

    @Schema(description = "Public URL of the uploaded resume file", example = "https://storage.example.com/resumes/123.pdf")
    private String fileUrl;

    @Schema(description = "Status of the review", example = "PENDING")
    private ReviewStatus reviewStatus;

    @Schema(description = "Timestamp when the file was uploaded")
    private LocalDateTime uploadedAt;
}
