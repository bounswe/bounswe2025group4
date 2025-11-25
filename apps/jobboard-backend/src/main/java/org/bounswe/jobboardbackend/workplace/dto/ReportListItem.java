package org.bounswe.jobboardbackend.workplace.dto;

import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportListItem {
    private Long id;
    private String targetType; // WORKPLACE | REVIEW
    private Long targetId;     // workplaceId veya reviewId
    private String reasonType; // enum name
    private String status;     // ReportStatus
    private Long createdByUserId;
    private String username;
    private String adminNote;
    private Instant createdAt;
}