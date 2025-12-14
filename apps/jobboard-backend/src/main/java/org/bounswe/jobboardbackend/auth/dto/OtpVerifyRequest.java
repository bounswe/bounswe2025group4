package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @Schema(description = "Username", example = "john_doe")
    @NotNull
    private String username;

    @Schema(description = "OTP Code received via email", example = "123456")
    @NotBlank
    private String otpCode;

    @Schema(description = "Temporary token received from login initiation", example = "temp_token_123")
    @NotBlank
    private String temporaryToken;
}