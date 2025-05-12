package org.bounswe.backend.common.exception;


import jakarta.validation.constraints.NotBlank;

public class InvalidResetTokenException extends RuntimeException {
    public InvalidResetTokenException(@NotBlank String token) {
        super("Invalid or expired reset token.");
    }
}
