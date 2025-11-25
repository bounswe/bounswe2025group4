package org.bounswe.jobboardbackend.mentorship.model;

import jakarta.persistence.*;
import lombok.Data;
import org.bounswe.jobboardbackend.auth.model.User;
import java.time.LocalDateTime;

@Entity
@Data
public class MentorReview {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_profile_id")
    private MentorProfile mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id")
    private User reviewer;

    @Column(nullable = false)
    private float rating;

    private String comment;
    private LocalDateTime createdAt;

}
