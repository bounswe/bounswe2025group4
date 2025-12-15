package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Standard API response message")
public class ApiMessage {
    @Schema(description = "Message content", example = "Operation successful")
    private String message;

    @Schema(description = "Message code", example = "SUCCESS")
    private String code;

    @Builder.Default
    @Schema(description = "Timestamp")
    private Instant timestamp = Instant.now();
}