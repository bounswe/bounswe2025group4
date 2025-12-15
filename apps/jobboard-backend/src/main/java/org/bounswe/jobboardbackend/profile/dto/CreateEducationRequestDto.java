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
@Schema(description = "Request object for adding education")
public class CreateEducationRequestDto {
    @Schema(description = "School or institution name", example = "Bogazici University")
    @NotBlank(message = "School is required")
    private String school;

    @Schema(description = "Degree obtained", example = "Bachelor of Science")
    @NotBlank(message = "Degree is required")
    private String degree;

    @Schema(description = "Field of study", example = "Computer Engineering")
    @NotBlank(message = "Field of study is required")
    private String field;

    @Schema(description = "Start date", example = "2018-09-01", type = "string", pattern = "yyyy-MM-dd")
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @Schema(description = "End date (can be null if current)", example = "2022-06-30", type = "string", pattern = "yyyy-MM-dd")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate; // optional

    @Schema(description = "Description or details", example = "Focus on software engineering.")
    private String description; // optional
}