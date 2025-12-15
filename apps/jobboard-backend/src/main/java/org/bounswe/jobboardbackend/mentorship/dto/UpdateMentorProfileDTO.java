package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(description = "Request payload for updating a mentor profile")
public record UpdateMentorProfileDTO(
                @NotEmpty(message = "Expertise list cannot be empty") @Schema(description = "Updated list of expertise areas", example = "[\"Java\", \"Spring Security\"]") List<String> expertise,

                @Min(value = 1, message = "You must be willing to mentor at least 1 person") @Schema(description = "Updated maximum number of mentees", example = "3") int maxMentees) {
}