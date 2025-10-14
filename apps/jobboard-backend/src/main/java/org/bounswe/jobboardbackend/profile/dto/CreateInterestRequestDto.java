package org.bounswe.jobboardbackend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInterestRequestDto {
    @NotBlank(message = "Interest is required")
    private String name;
}