package org.bounswe.backend.mentor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.common.enums.ReviewStatus;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "resume_reviews")
public class ResumeReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private User jobSeeker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    // Feedback provided by the mentor
    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Resume document or link
    private String resumeUrl;

    // Method to update feedback
    public void updateFeedback(String feedback) {
        this.feedback = feedback;
        this.updatedAt = LocalDateTime.now();
    }

    // Method to complete the review
    public void completeReview() {
        this.status = ReviewStatus.COMPLETED;
        this.updatedAt = LocalDateTime.now();
    }
}