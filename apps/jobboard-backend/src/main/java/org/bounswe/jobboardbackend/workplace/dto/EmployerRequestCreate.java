package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotNull;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for creating an employer request")
public class EmployerRequestCreate {
    @Schema(description = "Optional note explaining the request", example = "Joining as HR Lead.")
    private String note;
}