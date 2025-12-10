package org.bounswe.jobboardbackend.badge.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

/**
 * Represents a badge earned by a user.
 * Badges are completely independent of Profile - linked only to User.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "badges",
       uniqueConstraints = @UniqueConstraint(
           name = "uk_badge_user_type",
           columnNames = {"user_id", "badge_type"}
       ),
       indexes = {
           @Index(name = "ix_badges_user_id", columnList = "user_id")
       })
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "badge_type", nullable = false)
    private BadgeType badgeType;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String icon;

    @Column(length = 255)
    private String criteria;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant earnedAt;
}

