package org.bounswe.jobboardbackend.mentorship.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RespondToRequestDTO(
        @NotNull Boolean accept,
        @NotBlank String responseMessage
) {}
