package org.bounswe.backend.profile.entity;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.user.entity.User;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "user_badges")
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private String icon;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;
}
