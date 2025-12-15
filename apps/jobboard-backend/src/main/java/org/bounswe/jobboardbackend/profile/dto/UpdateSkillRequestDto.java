package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating skill")
public class UpdateSkillRequestDto {
    @Schema(description = "Name of the skill", example = "Python")
    private String name;

    @Schema(description = "Level of proficiency", example = "INTERMEDIATE")
    private String level;
}