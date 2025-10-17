package org.bounswe.jobboardbackend.exception;


import com.fasterxml.jackson.annotation.JsonInclude;


import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
        LocalDateTime timestamp,
        int status,
        String error,
        String code,
        String message,
        String path,
        List<Violation> violations
) {
    public record Violation(String field, String message) {}
}
