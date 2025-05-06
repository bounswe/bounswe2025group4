package org.bounswe.backend.comment.entity;
import org.bounswe.backend.thread.entity.Thread;
import jakarta.persistence.*;
import lombok.*;
import org.bounswe.backend.user.entity.User;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"author", "thread"})
@EqualsAndHashCode(exclude = {"author", "thread"})
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String body;

    @Column(nullable = false)
    private boolean reported = false;

    @ManyToOne
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @ManyToOne
    @JoinColumn(name = "thread_id", nullable = false)
    private Thread thread;
}
