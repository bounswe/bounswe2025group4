package org.bounswe.jobboardbackend.workplace.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Review details")
public class ReviewResponse {
    @Schema(description = "Review ID", example = "123")
    private Long id;

    @Schema(description = "Workplace ID", example = "10")
    private Long workplaceId;

    @Schema(description = "ID of the user who wrote the review (nullable if anonymous)", example = "55")
    private Long userId;

    @Schema(description = "Username of the reviewer (hidden if anonymous)", example = "jdoe")
    private String username;

    @Schema(description = "Name of the reviewer (hidden if anonymous)", example = "John Doe")
    private String nameSurname;

    @Schema(description = "Review title", example = "Great place to work")
    private String title;

    @Schema(description = "Review content", example = "I learned a lot here...")
    private String content;

    @Schema(description = "Whether the review is anonymous", example = "false")
    private boolean anonymous;

    @Schema(description = "Count of helpful votes", example = "10")
    private int helpfulCount;

    @Schema(description = "Overall rating score", example = "5.0")
    private Double overallRating;

    @Schema(description = "Ratings for specific ethical policies")
    private Map<String, Integer> ethicalPolicyRatings;

    @Schema(description = "Employer's reply to this review")
    private ReplyResponse reply;

    @Schema(description = "Whether the current user has marked this review as helpful", example = "true")
    private boolean isHelpfulByUser;

    @Schema(description = "Creation timestamp")
    private Instant createdAt;

    @Schema(description = "Last update timestamp")
    private Instant updatedAt;
}