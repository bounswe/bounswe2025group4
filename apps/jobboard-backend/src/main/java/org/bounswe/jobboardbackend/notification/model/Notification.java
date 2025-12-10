package org.bounswe.jobboardbackend.notification.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // null = global notification
    private String username;

    private String title;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    @Column(length = 500)
    private String message;

    private Long createdAt;

    private Long updatedAt;

    private boolean readFlag;
    private Long linkId;

}

