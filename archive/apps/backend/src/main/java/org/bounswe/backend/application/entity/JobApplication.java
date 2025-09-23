package org.bounswe.backend.application.entity;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.common.enums.JobApplicationStatus;
import org.bounswe.backend.job.entity.JobPost;
import org.bounswe.backend.user.entity.User;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "job_applications")
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id")
    private User jobSeeker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_posting_id")
    private JobPost jobPosting;

    @Enumerated(EnumType.STRING)
    private JobApplicationStatus status;

    @Column(length = 1000)
    private String feedback;

    @Temporal(TemporalType.TIMESTAMP)
    private Date submissionDate;

    // Helper methods
    public void updateStatus(JobApplicationStatus status) {
        this.status = status;
    }

    public void addFeedback(String feedback) {
        this.feedback = feedback;
    }
}
