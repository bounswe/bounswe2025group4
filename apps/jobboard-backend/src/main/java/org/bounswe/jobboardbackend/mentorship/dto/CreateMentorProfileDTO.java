package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Schema(description = "Request payload for creating a mentor profile")
public record CreateMentorProfileDTO(
                @NotEmpty(message = "Expertise list cannot be empty") @Schema(description = "List of expertise areas", example = "[\"Java\", \"Spring Boot\", \"Career Advice\"]") List<String> expertise,

                @Min(value = 1, message = "You must be willing to mentor at least 1 person") @Schema(description = "Maximum number of mentees the mentor is willing to take", example = "5") int maxMentees) {
}
