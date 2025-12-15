package org.bounswe.jobboardbackend.jobapplication.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.workplace.dto.WorkplaceBriefResponse;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Response object representing a job application")
public class JobApplicationResponse {

    @Schema(description = "Unique identifier of the application", example = "50")
    private Long id;

    @Schema(description = "Title of the job application (usually derived from job post)", example = "Senior Java Developer Application")
    private String title;

    @Schema(description = "Brief details of the workplace associated with the job post")
    private WorkplaceBriefResponse workplace;

    @Schema(description = "Name of the applicant", example = "John Doe")
    private String applicantName;

    @Schema(description = "ID of the job seeker who applied", example = "5")
    private Long jobSeekerId;

    @Schema(description = "ID of the job post applied to", example = "10")
    private Long jobPostId;

    @Schema(description = "Current status of the application", example = "PENDING")
    private JobApplicationStatus status;

    @Schema(description = "Special needs or disabilities reported by applicant", example = "None")
    private String specialNeeds;

    @Schema(description = "Feedback from the employer", example = "Interview scheduled")
    private String feedback;

    @Schema(description = "URL of the uploaded CV", example = "https://storage.example.com/cvs/123.pdf")
    private String cvUrl;

    @Schema(description = "Cover letter content", example = "I am writing to apply...")
    private String coverLetter;

    @Schema(description = "Date when the application was submitted")
    private LocalDateTime appliedDate;
}
