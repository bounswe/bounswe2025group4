package org.bounswe.backend.comment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateCommentRequestDto {
    @NotBlank(message = "Comment body cannot be empty")
    private String body;
}