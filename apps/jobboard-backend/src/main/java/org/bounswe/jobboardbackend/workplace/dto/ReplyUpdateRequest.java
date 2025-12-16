package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request object for updating a reply")
public class ReplyUpdateRequest {
    @Schema(description = "Updated content of the reply", example = "Updated response to your feedback.")
    @NotBlank
    @Size(max = 2000)
    private String content;
}