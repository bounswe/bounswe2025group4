package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordResetConfirmRequest {
    @Schema(description = "Reset token from email", example = "reset_token_123")
    @NotBlank
    String token;
    @Schema(description = "New password", example = "NewPassword123!")
    @Size(min = 6)
    String newPassword;
}
