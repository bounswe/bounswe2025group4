package org.bounswe.backend.mentor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.common.enums.MentorshipRequestStatus;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "mentorship_requests")
public class MentorshipRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @Column(nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MentorshipRequestStatus status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // If the request is accepted, this will be the direct messaging channel ID
    private String channelId;

    // List of messages exchanged in this mentorship request
    @OneToMany(mappedBy = "mentorshipRequest", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    // Method to add a message to the request
    public void addMessage(Message message) {
        messages.add(message);
        message.setMentorshipRequest(this);
    }
}
