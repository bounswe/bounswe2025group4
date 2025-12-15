package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.bounswe.jobboardbackend.mentorship.model.RequestStatus;
import org.bounswe.jobboardbackend.mentorship.model.ReviewStatus;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@Schema(description = "Combined details of a mentorship interaction")
public class MentorshipDetailsDTO {

    @Schema(description = "ID of the mentorship request", example = "50")
    private Long mentorshipRequestId;

    @Schema(description = "Status of the mentorship request", example = "ACCEPTED")
    private RequestStatus requestStatus;

    @Schema(description = "Timestamp when the request was created")
    private LocalDateTime requestCreatedAt;

    @Schema(description = "ID of the mentor", example = "10")
    private Long mentorId;

    @Schema(description = "Username of the mentor", example = "mentor_jane")
    private String mentorUsername;

    @Schema(description = "ID of the resume review session (if any)", example = "100")
    private Long resumeReviewId;

    @Schema(description = "Status of the review session", example = "COMPLETED")
    private ReviewStatus reviewStatus;

    @Schema(description = "ID of the chat conversation associated with this mentorship", example = "200")
    private Long conversationId;
}