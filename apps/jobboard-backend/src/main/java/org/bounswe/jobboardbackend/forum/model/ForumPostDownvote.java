package org.bounswe.jobboardbackend.forum.model;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.jobboardbackend.auth.model.User;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "forum_post_downvotes", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "post_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumPostDownvote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private ForumPost post;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}
