package org.bounswe.jobboardbackend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProfileRequestDto {
    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String bio; // optional

    @Pattern(regexp = "^(?i)(MALE|FEMALE|OTHER)$")
    private String gender;
}