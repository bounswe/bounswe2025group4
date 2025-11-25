package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumCommentUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumCommentUpvoteRepository extends JpaRepository<ForumCommentUpvote, Long> {
    Optional<ForumCommentUpvote> findByUserIdAndCommentId(Long userId, Long commentId);

    long countByCommentId(Long commentId);
}
