package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for creating a mentorship request")
public record CreateMentorshipRequestDTO(
                @NotNull @Schema(description = "ID of the mentor to request mentorship from", example = "10") Long mentorId,

                @NotBlank @Schema(description = "Motivation letter or message for the mentor", example = "I admire your work in...") String motivation) {
}
