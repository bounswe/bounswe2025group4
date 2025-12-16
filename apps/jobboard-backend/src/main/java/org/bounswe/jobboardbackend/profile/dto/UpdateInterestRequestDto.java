package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating interest")
public class UpdateInterestRequestDto {
    @Schema(description = "Name of the interest", example = "Deep Learning")
    private String name;
}