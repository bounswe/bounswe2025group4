package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Request payload for updating an existing forum post")
public class UpdatePostRequest {
    @Schema(description = "New title of the post (optional)", example = "Updated: Salary Negotiation Advice")
    private String title;

    @Schema(description = "New content of the post (optional)", example = "Thanks everyone for the advice!")
    private String content;

    @Schema(description = "New list of tags (optional)", example = "[\"salary\", \"success\"]")
    private List<String> tags;
}
