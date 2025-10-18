package org.bounswe.jobboardbackend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotNull
    private String username;

    @NotBlank
    private String otpCode;

    @NotBlank
    private String temporaryToken;
}