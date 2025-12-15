package org.bounswe.jobboardbackend.jobapplication.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request payload for updating a job application (e.g. providing feedback)")
public class UpdateJobApplicationRequest {

    @Size(max = 1000)
    @Schema(description = "Employer feedback for acceptance or rejection (optional)", example = "Impressive portfolio, welcome aboard!")
    private String feedback; // Optional: employer feedback when approving/rejecting
}
