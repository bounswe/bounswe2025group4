package org.bounswe.jobboardbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class PasswordResetConfirmRequest {
    @NotBlank
    String token;
    @Size(min = 6)
    String newPassword;
}
