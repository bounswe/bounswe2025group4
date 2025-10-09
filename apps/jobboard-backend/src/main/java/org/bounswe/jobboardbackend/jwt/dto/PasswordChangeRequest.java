package org.bounswe.jobboardbackend.jwt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class PasswordChangeRequest {
    @NotBlank
    String currentPassword;
    @Size(min = 8, max = 128)
    String newPassword;
}
