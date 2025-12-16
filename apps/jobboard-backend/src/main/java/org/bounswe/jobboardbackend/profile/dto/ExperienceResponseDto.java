package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Experience entry details")
public class ExperienceResponseDto {
    @Schema(description = "ID of the experience entry", example = "5")
    private Long id;

    @Schema(description = "Company name", example = "Amazon")
    private String company;

    @Schema(description = "Position", example = "DevOps Engineer")
    private String position;

    @Schema(description = "Description", example = "Infrastructure management.")
    private String description;

    @Schema(description = "Start date", example = "2021-05-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Schema(description = "End date", example = "2022-12-31")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}