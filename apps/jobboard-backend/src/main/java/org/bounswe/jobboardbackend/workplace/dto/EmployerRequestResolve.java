package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for resolving an employer request")
public class EmployerRequestResolve {
    @Schema(description = "Action to take (APPROVE or REJECT)", example = "APPROVE")
    @NotBlank
    private String action; // APPROVE | REJECT
}