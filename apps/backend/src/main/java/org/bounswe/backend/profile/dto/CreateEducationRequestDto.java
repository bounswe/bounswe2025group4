package org.bounswe.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

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

    @NotBlank(message = "Start date is required")
    private String startDate;

    private String endDate; // Optional
}
