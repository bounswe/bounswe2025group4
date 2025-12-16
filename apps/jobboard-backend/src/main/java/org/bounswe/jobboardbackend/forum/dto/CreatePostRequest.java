package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Request payload for creating a new forum post")
public class CreatePostRequest {
    @NotBlank(message = "Title is required")
    @Schema(description = "Title of the post", example = "Need advice on salary negotiation")
    private String title;

    @NotBlank(message = "Content is required")
    @Schema(description = "Content of the post", example = "I received an offer but it's lower than expected...")
    private String content;

    @Schema(description = "List of tags", example = "[\"salary\", \"negotiation\", \"career\"]")
    private List<String> tags;
}
