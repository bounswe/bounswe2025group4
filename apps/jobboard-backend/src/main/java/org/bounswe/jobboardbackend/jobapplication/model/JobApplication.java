package org.bounswe.jobboardbackend.jobapplication.model;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.auth.model.User;

import java.time.LocalDateTime;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private User jobSeeker;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private JobApplicationStatus status;

    @Column(length = 500)
    private String specialNeeds;  // Optional: disabilities or special needs

    @Column(length = 1000)
    private String feedback;  // Optional: employer feedback when approving/rejecting

    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedDate;
}
