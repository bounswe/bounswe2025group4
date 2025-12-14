package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumCommentUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumCommentUpvoteRepository extends JpaRepository<ForumCommentUpvote, Long> {
    Optional<ForumCommentUpvote> findByUserIdAndCommentId(Long userId, Long commentId);

    long countByCommentId(Long commentId);
    
    /**
     * Count total upvotes received by a user on all their comments.
     * Used for badge criteria checking (Helpful, Valuable Contributor badges).
     */
    @Query("SELECT COUNT(u) FROM ForumCommentUpvote u WHERE u.comment.author.id = :userId")
    long countUpvotesReceivedByUser(@Param("userId") Long userId);
}
