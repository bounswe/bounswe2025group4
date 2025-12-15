package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for adding a skill")
public class CreateSkillRequestDto {
    @Schema(description = "Name of the skill", example = "Java")
    @NotBlank(message = "Skill name is required")
    private String name;

    @Schema(description = "Proficiency level", example = "ADVANCED")
    private String level; // optional: e.g., BEGINNER/INTERMEDIATE/ADVANCED
}