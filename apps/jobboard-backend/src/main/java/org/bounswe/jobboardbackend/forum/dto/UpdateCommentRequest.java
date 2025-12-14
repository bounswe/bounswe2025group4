package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request payload for updating a comment")
public class UpdateCommentRequest {
    @NotBlank(message = "Content is required")
    @Schema(description = "New content of the comment", example = "Updated: Great advice, really helped!")
    private String content;
}
