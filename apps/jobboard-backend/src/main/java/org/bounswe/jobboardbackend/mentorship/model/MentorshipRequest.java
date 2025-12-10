package org.bounswe.jobboardbackend.mentorship.model;


import jakarta.persistence.*;
import lombok.Data;
import org.bounswe.jobboardbackend.auth.model.User;

import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "mentorship_request")
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

    @Column(nullable = false, columnDefinition = "TEXT DEFAULT 'Not provided'")
    private String motivation;

    @Column
    private String responseMessage;

    public void accept(String message) {
        this.status = RequestStatus.ACCEPTED;
        this.responseMessage = message;
    }

    public void decline(String message) {
        this.status = RequestStatus.DECLINED;
        this.responseMessage = message;
    }


}