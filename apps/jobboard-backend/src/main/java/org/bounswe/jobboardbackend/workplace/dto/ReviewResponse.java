package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long workplaceId;
    private Long userId; // TODO: anon dönerken frontend göstermeyebilir
    private String title;
    private String content;
    private boolean anonymous;
    private int helpfulCount;
    private Double overallRating;
    private Map<String, Integer> ethicalPolicyRatings;
    private ReplyResponse reply; // varsa
    private Instant createdAt;
    private Instant updatedAt;
}