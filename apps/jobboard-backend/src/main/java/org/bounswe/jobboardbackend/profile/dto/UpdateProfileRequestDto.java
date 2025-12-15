package org.bounswe.jobboardbackend.profile.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating user profile")
public class UpdateProfileRequestDto {
    @Schema(description = "First name of the user", example = "John")
    private String firstName; // optional (partial update)

    @Schema(description = "Last name of the user", example = "Doe")
    private String lastName; // optional

    @Schema(description = "Biography or summary", example = "Updated bio.")
    private String bio; // optional

    @Schema(description = "Pronoun set", example = "FEMALE")
    private String pronounSet;
}