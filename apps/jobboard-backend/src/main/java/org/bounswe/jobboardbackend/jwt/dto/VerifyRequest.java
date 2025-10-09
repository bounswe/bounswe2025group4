package org.bounswe.jobboardbackend.jwt.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyRequest {

    @NotBlank
    private String token;
}
