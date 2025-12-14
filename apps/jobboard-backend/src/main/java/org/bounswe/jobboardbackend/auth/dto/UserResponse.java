package org.bounswe.jobboardbackend.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    @Schema(description = "User's unique identifier", example = "1")
    private Long id;
    @Schema(description = "User's unique username", example = "john_doe")
    private String username;
    @Schema(description = "User's email address", example = "john.doe@example.com")
    private String email;
    @Schema(description = "User's role", example = "CANDIDATE")
    private String role;

}
