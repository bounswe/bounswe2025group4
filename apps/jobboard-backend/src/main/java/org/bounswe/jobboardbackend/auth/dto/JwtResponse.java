package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
public class JwtResponse {

    @Schema(description = "JWT Access Token", example = "eyJhbGciOiJIUzI1NiJ9...")
    private String token;
    @Schema(description = "Token type", example = "Bearer")
    private String type = "Bearer";
    @Schema(description = "User ID", example = "1")
    private Long id;
    @Schema(description = "Username", example = "john_doe")
    private String username;
    @Schema(description = "Email", example = "john.doe@example.com")
    private String email;
    @Schema(description = "User Role", example = "CANDIDATE")
    private String role;

    public JwtResponse(String accessToken, Long id, String username, String email, String role) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.role = role;
    }

}
