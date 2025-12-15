package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating experience")
public class UpdateExperienceRequestDto {
    @Schema(description = "Company name", example = "Google")
    private String company;

    @Schema(description = "Position", example = "Senior Engineer")
    private String position;

    @Schema(description = "Description", example = "Updated description.")
    private String description;

    @Schema(description = "Start date", example = "2020-01-01", type = "string", pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Schema(description = "End date", example = "2023-01-01", type = "string", pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}