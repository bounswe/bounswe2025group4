package org.bounswe.jobboardbackend.jobapplication.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobApplicationRequest {

    @NotNull(message = "Job post ID is required")
    private Long jobPostId;

    @Size(max = 500)
    private String specialNeeds;  // Optional: disabilities or special needs

    @Size(max = 2000, message = "Cover letter must not exceed 2000 characters")
    private String coverLetter;  // Optional: Cover letter / motivation letter
}

