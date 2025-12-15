package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Interest details")
public class InterestResponseDto {
    @Schema(description = "ID of the interest", example = "42")
    private Long id;

    @Schema(description = "Name of the interest", example = "Machine Learning")
    private String name;
}