package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumPostUpvote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForumPostUpvoteRepository extends JpaRepository<ForumPostUpvote, Long> {
    Optional<ForumPostUpvote> findByUserIdAndPostId(Long userId, Long postId);

    long countByPostId(Long postId);

    void deleteByUserId(Long userId);
}
