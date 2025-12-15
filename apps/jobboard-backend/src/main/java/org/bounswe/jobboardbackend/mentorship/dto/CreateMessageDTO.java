package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Data Transfer Object for creating a new chat message")
public record CreateMessageDTO(
                @NotBlank @Schema(description = "Content of the message to send", example = "I would like to schedule a mentorship session.") String content) {
}