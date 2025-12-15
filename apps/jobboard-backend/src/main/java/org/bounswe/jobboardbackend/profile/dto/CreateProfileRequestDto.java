package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request creation object for user profile")
public class CreateProfileRequestDto {
    @Schema(description = "First name of the user", example = "John")
    @NotBlank(message = "First name is required")
    private String firstName;

    @Schema(description = "Last name of the user", example = "Doe")
    @NotBlank(message = "Last name is required")
    private String lastName;

    @Schema(description = "Biography or summary", example = "Software Engineer with 10 years of experience")
    private String bio; // optional

    @Schema(description = "Pronoun set", example = "MALE")
    @Pattern(regexp = "^(?i)(MALE|FEMALE|OTHER)$")
    private String pronounSet;
}