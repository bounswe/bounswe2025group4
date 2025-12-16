package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @Schema(description = "User's unique username", example = "john_doe")
    @NotBlank
    private String username;

    @Schema(description = "User's password", example = "Password123!")
    @NotBlank
    private String password;
}
