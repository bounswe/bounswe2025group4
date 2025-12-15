package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for adding experience")
public class CreateExperienceRequestDto {
    @Schema(description = "Company name", example = "Google")
    @NotBlank(message = "Company is required")
    private String company;

    @Schema(description = "Position title", example = "Software Engineer")
    @NotBlank(message = "Position is required")
    private String position;

    @Schema(description = "Description of responsibilities", example = "Worked on backend services.")
    private String description;

    @Schema(description = "Start date", example = "2020-01-01", type = "string", pattern = "yyyy-MM-dd")
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Schema(description = "End date", example = "2023-01-01", type = "string", pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate; // optional
}