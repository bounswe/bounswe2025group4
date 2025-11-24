package org.bounswe.jobboardbackend.forum.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateCommentRequest {
    @NotBlank(message = "Content is required")
    private String content;
    private Long parentCommentId;
}
