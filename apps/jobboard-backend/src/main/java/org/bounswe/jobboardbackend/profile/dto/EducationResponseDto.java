package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Education entry details")
public class EducationResponseDto {
    @Schema(description = "ID of the education entry", example = "1")
    private Long id;

    @Schema(description = "School name", example = "Bogazici University")
    private String school;

    @Schema(description = "Degree", example = "BSc")
    private String degree;

    @Schema(description = "Field of study", example = "Computer Science")
    private String field;

    @Schema(description = "Start date", example = "2018-09-01")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Schema(description = "End date", example = "2022-06-30")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @Schema(description = "Description", example = "Graduated with honors.")
    private String description;
}