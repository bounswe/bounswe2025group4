package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OtpRequestResponse {
    @Schema(description = "Username", example = "john_doe")
    private String username;
    @Schema(description = "Response message", example = "OTP sent to email")
    private String message;
    @Schema(description = "Temporary token for OTP verification", example = "temp_token_123")
    private String temporaryToken;
}