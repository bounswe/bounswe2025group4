package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Summary of a workplace for an employer")
public class EmployerWorkplaceBrief {
    // "OWNER" or "MANAGER"
    @Schema(description = "Role of the user in this workplace", example = "MANAGER")
    private String role;

    @Schema(description = "Brief details of the workplace")
    private WorkplaceBriefResponse workplace;
}