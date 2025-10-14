package org.bounswe.jobboardbackend.profile.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateEducationRequestDto {
    @NotBlank(message = "School is required")
    private String school;

    @NotBlank(message = "Degree is required")
    private String degree;

    @NotBlank(message = "Field of study is required")
    private String field;

    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate; // optional

    private String description; // optional
}