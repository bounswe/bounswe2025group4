package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    
    /**
     * Count total posts created by a user.
     * Used for badge criteria checking.
     */
    long countByAuthorId(Long authorId);

    /**
     * Count posts created after a given date.
     * Used for dashboard statistics (e.g., posts this week).
     */
    long countByCreatedAtAfter(java.time.Instant date);
}
