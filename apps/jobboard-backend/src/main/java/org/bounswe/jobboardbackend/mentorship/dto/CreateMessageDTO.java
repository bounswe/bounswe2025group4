package org.bounswe.jobboardbackend.mentorship.dto;


import jakarta.validation.constraints.NotBlank;

public record CreateMessageDTO(
        @NotBlank String content
) {}