package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating education")
public class UpdateEducationRequestDto {
    @Schema(description = "School name", example = "Bogazici University")
    private String school;

    @Schema(description = "Degree", example = "BSc")
    private String degree;

    @Schema(description = "Field of study", example = "Computer Science")
    private String field;

    @Schema(description = "Start date", example = "2018-09-01", type = "string", pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Schema(description = "End date", example = "2022-06-30", type = "string", pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @Schema(description = "Description", example = "Updated description.")
    private String description;
}