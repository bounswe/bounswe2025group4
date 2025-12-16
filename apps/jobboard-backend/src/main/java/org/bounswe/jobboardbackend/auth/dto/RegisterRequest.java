package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterRequest {
    @Schema(description = "User's unique username", example = "john_doe")
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @Schema(description = "User's email address", example = "john.doe@example.com")
    @NotBlank
    @Size(max = 50)
    @Email
    private String email;

    @Schema(description = "User's role", example = "CANDIDATE", allowableValues = { "CANDIDATE", "EMPLOYER",
            "MODERATOR", "ADMIN" })
    @NotBlank
    private String role;

    @Schema(description = "User's password", example = "Password123!")
    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    @Schema(description = "User's first name", example = "John")
    @NotBlank
    @Size(min = 2, max = 30)
    private String firstName;

    @Schema(description = "User's last name", example = "Doe")
    @NotBlank
    @Size(min = 2, max = 30)
    private String lastName;

    @Schema(description = "User's preferred pronouns", example = "HE_HIM", allowableValues = { "HE_HIM", "SHE_HER",
            "THEY_THEM", "SHE_THEY", "HE_THEY", "OTHER", "NONE" })
    @Pattern(regexp = "^(?i)(HE_HIM|SHE_HER|THEY_THEM|SHE_THEY|HE_THEY|OTHER|NONE)$", message = "Invalid pronoun set")
    private String pronounSet;

    @Schema(description = "Short biography of the user", example = "Software Engineer with 5 years of experience.")
    @Size(max = 250)
    private String bio;
}
