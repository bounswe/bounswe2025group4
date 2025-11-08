package org.bounswe.jobboardbackend.mentorship.model;


import jakarta.persistence.*;
import lombok.Data;
import org.bounswe.jobboardbackend.auth.model.User;

import java.time.LocalDateTime;

@Entity
@Data
public class MentorshipRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id")
    private User requester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_profile_id")
    private MentorProfile mentor;

    @Enumerated(EnumType.STRING)
    private RequestStatus status;

    private LocalDateTime createdAt;

    public void accept() {
        this.status = RequestStatus.ACCEPTED;
    }

    public void decline() {
        this.status = RequestStatus.DECLINED;
    }


}