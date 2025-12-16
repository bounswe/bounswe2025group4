package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Request payload for responding to a mentorship request")
public record RespondToRequestDTO(
                @NotNull @Schema(description = "Whether to accept (true) or reject (false) the request", example = "true") Boolean accept,

                @NotBlank @Schema(description = "Message to send along with the response", example = "Looking forward to it.") String responseMessage) {
}
