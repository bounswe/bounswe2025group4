package org.bounswe.backend.auth.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetResponse {
    private String message;
}
