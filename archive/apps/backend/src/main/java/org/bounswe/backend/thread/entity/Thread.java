package org.bounswe.backend.thread.entity;

import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.comment.entity.Comment;
import org.bounswe.backend.tag.entity.Tag;
import org.bounswe.backend.user.entity.User;

import java.util.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"comments", "tags", "likedBy"})
@EqualsAndHashCode(exclude = {"comments", "tags", "likedBy"})
@Table(name = "threads")
public class Thread {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String body;

    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToMany
    @JoinTable(
            name = "thread_tags",
            joinColumns = @JoinColumn(name = "thread_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "thread", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    private int commentCount = 0;

    @ManyToMany
    @JoinTable(
            name = "thread_likes",
            joinColumns = @JoinColumn(name = "thread_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likedBy = new HashSet<>();


    @Column(nullable = false)
    private boolean reported = false;


    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime editedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
