package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Data Transfer Object for mentor profile summary")
public record MentorProfileDTO(
                @Schema(description = "ID of the mentor profile (user ID of the mentor)", example = "10") String id,

                @Schema(description = "Username of the mentor", example = "mentor_jane") String username,

                @Schema(description = "List of expertise areas", example = "[\"Java\", \"Spring Boot\"]") List<String> expertise,

                @Schema(description = "Number of current mentees", example = "2") int currentMentees,

                @Schema(description = "Maximum number of mentees", example = "5") int maxMentees,

                @Schema(description = "Average rating of the mentor", example = "4.8") float averageRating,

                @Schema(description = "Total number of reviews received", example = "15") int reviewCount) {
}