package org.bounswe.jobboardbackend.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminActionResponse {
    @Schema(description = "Message indicating the result of the action", example = "Report resolved successfully")
    private String message;
}
