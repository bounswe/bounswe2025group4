package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumCommentDownvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ForumCommentDownvoteRepository extends JpaRepository<ForumCommentDownvote, Long> {
    Optional<ForumCommentDownvote> findByUserIdAndCommentId(Long userId, Long commentId);

    long countByCommentId(Long commentId);
}
