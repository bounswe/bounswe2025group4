package org.bounswe.backend.auth.dto;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class PasswordResetRequest {
    @NotBlank
    private String token;

    @NotBlank
    private String newPassword;
}