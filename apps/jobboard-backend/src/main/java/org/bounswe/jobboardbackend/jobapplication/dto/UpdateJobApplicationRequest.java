package org.bounswe.jobboardbackend.jobapplication.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJobApplicationRequest {

    @Size(max = 1000)
    private String feedback;  // Optional: employer feedback when approving/rejecting
}

