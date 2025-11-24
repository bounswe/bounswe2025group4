package org.bounswe.jobboardbackend.mentorship.model;


import jakarta.persistence.*;
import lombok.Data;
import org.bounswe.jobboardbackend.auth.model.User;
import java.time.LocalDateTime;

@Entity
@Data
public class ResumeReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id")
    private User jobSeeker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_profile_id")
    private MentorProfile mentor;

    private String feedback;

    @Enumerated(EnumType.STRING)
    private ReviewStatus status;

    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentorship_request_id")
    private MentorshipRequest mentorshipRequest;

    @OneToOne(mappedBy = "resumeReview", cascade = CascadeType.ALL)
    private Conversation conversation;

    private String resumeUrl;

    private LocalDateTime resumeUploadedAt;

}