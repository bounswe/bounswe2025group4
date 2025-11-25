package org.bounswe.jobboardbackend.mentorship.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.bounswe.jobboardbackend.mentorship.model.RequestStatus;
import org.bounswe.jobboardbackend.mentorship.model.ReviewStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MentorshipDetailsDTO {

    private Long mentorshipRequestId;
    private RequestStatus requestStatus;
    private LocalDateTime requestCreatedAt;

    private Long mentorId;
    private String mentorUsername;

    private Long resumeReviewId;
    private ReviewStatus reviewStatus;

    private Long conversationId;
}