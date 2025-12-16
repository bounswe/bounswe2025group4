package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;

@Repository
public interface ForumCommentRepository extends JpaRepository<ForumComment, Long> {
    long countByAuthorIdAndPostIdAndCreatedAtAfter(Long authorId, Long postId, Instant createdAt);
    
    /**
     * Count total comments made by a user.
     * Used for badge criteria checking.
     */
    long countByAuthorId(Long authorId);

    void deleteByAuthorId(Long authorId);
}
