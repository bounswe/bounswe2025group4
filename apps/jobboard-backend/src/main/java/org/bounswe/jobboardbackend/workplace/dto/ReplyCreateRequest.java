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
@Schema(description = "Request object for creating a reply")
public class ReplyCreateRequest {
    @Schema(description = "Content of the reply", example = "We appreciate your feedback and will look into this.")
    @NotBlank
    @Size(max = 2000)
    private String content;
}