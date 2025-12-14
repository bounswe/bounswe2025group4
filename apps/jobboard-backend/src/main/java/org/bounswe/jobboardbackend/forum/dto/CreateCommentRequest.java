package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
@Schema(description = "Request payload for adding a comment to a post")
public class CreateCommentRequest {
    @NotBlank(message = "Content is required")
    @Schema(description = "Content of the comment", example = "Great advice, thanks!")
    private String content;

    @Schema(description = "ID of the parent comment if this is a reply (optional)", example = "50")
    private Long parentCommentId;
}
