package org.bounswe.jobboardbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class PasswordChangeRequest {
    @NotBlank(message = "Password must not be blank")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters")
    String currentPassword;
    @NotBlank(message = "Password must not be blank")
    @Size(min = 8, max = 128, message = "Password must be 8–128 characters")
    String newPassword;
}
