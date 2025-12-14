package org.bounswe.jobboardbackend.forum.repository;

import org.bounswe.jobboardbackend.forum.model.ForumPostDownvote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ForumPostDownvoteRepository extends JpaRepository<ForumPostDownvote, Long> {
    Optional<ForumPostDownvote> findByUserIdAndPostId(Long userId, Long postId);

    long countByPostId(Long postId);
}
