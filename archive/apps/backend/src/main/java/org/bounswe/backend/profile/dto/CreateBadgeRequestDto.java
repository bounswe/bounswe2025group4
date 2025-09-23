package org.bounswe.backend.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBadgeRequestDto {

    @NotBlank(message = "Badge name is required")
    private String name;

    @NotBlank(message = "Badge description is required")
    private String description;

    @NotBlank(message = "Badge icon is required")
    private String icon;
}
