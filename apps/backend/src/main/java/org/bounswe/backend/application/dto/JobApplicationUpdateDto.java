package org.bounswe.backend.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.bounswe.backend.common.enums.JobApplicationStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplicationUpdateDto {
    
    @NotNull(message = "Status is required")
    private JobApplicationStatus status;
    
    private String feedback;
}