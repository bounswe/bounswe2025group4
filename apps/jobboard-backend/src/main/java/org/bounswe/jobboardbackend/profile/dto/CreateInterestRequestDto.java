package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for adding an interest")
public class CreateInterestRequestDto {
    @Schema(description = "Name of the interest", example = "Artificial Intelligence")
    @NotBlank(message = "Interest is required")
    private String name;
}