package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyResponse {
    private Long id;
    private Long reviewId;
    private Long employerUserId;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
}