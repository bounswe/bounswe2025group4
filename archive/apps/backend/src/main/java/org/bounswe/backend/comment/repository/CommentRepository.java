package org.bounswe.backend.comment.repository;

import org.bounswe.backend.comment.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByThreadId(Long threadId);
}
