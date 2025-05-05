package org.bounswe.backend.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.bounswe.backend.common.enums.JobApplicationStatus;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationDto {

    private Long id;
    
    @NotNull(message = "Job seeker ID is required")
    private Long jobSeekerId;
    
    @NotNull(message = "Job posting ID is required")
    private Long jobPostingId;
    
    private JobApplicationStatus status;
    
    private String feedback;
    
    private Date submissionDate;
}
