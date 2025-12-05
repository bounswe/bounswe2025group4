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
    private Long userId;
    private String username;
    private String nameSurname;
    private String title;
    private String content;
    private boolean anonymous;
    private int helpfulCount;
    private Double overallRating;
    private Map<String, Integer> ethicalPolicyRatings;
    private ReplyResponse reply;
    private boolean isHelpfulByUser;
    private Instant createdAt;
    private Instant updatedAt;
}