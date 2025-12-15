package org.bounswe.jobboardbackend.exception;

import com.fasterxml.jackson.annotation.JsonInclude;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API Error Response")
public record ApiError(
                @Schema(description = "Timestamp of the error", example = "2023-10-01T12:00:00") LocalDateTime timestamp,

                @Schema(description = "HTTP status code", example = "400") int status,

                @Schema(description = "HTTP error reason", example = "Bad Request") String error,

                @Schema(description = "Application-specific error code", example = "ERROR_CODE") String code,

                @Schema(description = "Error message", example = "Detailed error message") String message,

                @Schema(description = "Request path", example = "/api/path") String path,

                @Schema(description = "List of validation errors (if any)") List<Violation> violations) {
        @Schema(description = "Validation violation detail")
        public record Violation(
                        @Schema(description = "Field name", example = "fieldName") String field,
                        @Schema(description = "Error message", example = "validation error message") String message) {
        }
}
