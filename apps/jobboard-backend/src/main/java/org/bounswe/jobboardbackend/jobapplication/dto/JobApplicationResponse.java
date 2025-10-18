package org.bounswe.jobboardbackend.jobapplication.dto;

import lombok.*;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationResponse {

    private Long id;
    private String title;
    private String company;
    private String applicantName;
    private Long jobSeekerId;
    private Long jobPostId;
    private JobApplicationStatus status;
    private String specialNeeds;
    private String feedback;
    private String cvUrl;
    private String coverLetter;
    private LocalDateTime appliedDate;
}

