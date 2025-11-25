package org.bounswe.jobboardbackend.mentorship.model;

import jakarta.persistence.*;
import lombok.Data;
import org.bounswe.jobboardbackend.auth.model.User;

import java.time.LocalDateTime;

@Entity
@Data
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id")
    private User sender;

    @Lob
    private String content;

    private String fileUrl; // URL of uploaded file attachment

    private LocalDateTime timestamp;

}