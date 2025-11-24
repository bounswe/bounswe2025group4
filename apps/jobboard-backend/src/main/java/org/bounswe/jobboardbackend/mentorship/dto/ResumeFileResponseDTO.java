package org.bounswe.jobboardbackend.mentorship.dto;

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
public class ResumeFileResponseDTO {

    private Long resumeReviewId;
    private String fileUrl;
    private ReviewStatus reviewStatus;
    private LocalDateTime uploadedAt;
}

