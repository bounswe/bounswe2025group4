package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordChangeRequest {
    @Schema(description = "Current password", example = "OldPassword123!")
    @NotBlank(message = "Password must not be blank")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters")
    String currentPassword;
    @Schema(description = "New password", example = "NewPassword123!")
    @NotBlank(message = "Password must not be blank")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters")
    String newPassword;
}
