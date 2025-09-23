package org.bounswe.backend.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationCreateDto {
    
    @NotNull(message = "Job seeker ID is required")
    private Long jobSeekerId;
    
    @NotNull(message = "Job posting ID is required")
    private Long jobPostingId;
}