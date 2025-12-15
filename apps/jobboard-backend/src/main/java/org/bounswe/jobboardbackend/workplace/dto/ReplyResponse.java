package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Employer's reply to a review")
public class ReplyResponse {
    @Schema(description = "Reply ID", example = "789")
    private Long id;

    @Schema(description = "ID of the review being replied to", example = "123")
    private Long reviewId;

    @Schema(description = "Name of the workplace", example = "Acme Corp")
    private String workplaceName;

    @Schema(description = "ID of the employer user who replied", example = "99")
    private Long employerUserId;

    @Schema(description = "Reply content", example = "Thank you for your feedback.")
    private String content;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    @Schema(description = "Last update timestamp")
    private Instant updatedAt;
}