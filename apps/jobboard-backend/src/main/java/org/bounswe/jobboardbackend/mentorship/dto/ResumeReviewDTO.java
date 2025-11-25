package org.bounswe.jobboardbackend.mentorship.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.jobboardbackend.mentorship.model.ReviewStatus;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResumeReviewDTO {
    private Long resumeReviewId;
    private String fileUrl;
    private ReviewStatus reviewStatus;
    private String feedback;
}
