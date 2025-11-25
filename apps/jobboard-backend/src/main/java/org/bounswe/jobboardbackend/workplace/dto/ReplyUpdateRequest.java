package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyUpdateRequest {
    @NotBlank
    @Size(max = 2000)
    private String content;
}