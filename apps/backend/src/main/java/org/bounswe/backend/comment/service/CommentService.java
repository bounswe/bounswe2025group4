package org.bounswe.backend.comment.service;

import org.bounswe.backend.comment.dto.CommentDto;
import org.bounswe.backend.comment.dto.CreateCommentRequestDto;
import org.bounswe.backend.comment.entity.Comment;
import org.bounswe.backend.comment.repository.CommentRepository;
import org.bounswe.backend.thread.entity.Thread;
import org.bounswe.backend.thread.repository.ThreadRepository;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;


@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final ThreadRepository threadRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository,
                          ThreadRepository threadRepository,
                          UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.threadRepository = threadRepository;
        this.userRepository = userRepository;

    }

    public List<CommentDto> getCommentsByThreadId(Long threadId) {
        if (!threadRepository.existsById(threadId)) {
            throw new RuntimeException("Thread not found");
        }

        return commentRepository.findByThreadId(threadId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CommentDto addCommentToThread(Long threadId, Long userId, CreateCommentRequestDto dto) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .body(dto.getBody())
                .author(user)
                .thread(thread)
                .createdAt(LocalDateTime.now())
                .build();
        Comment savedComment = commentRepository.save(comment);

        thread.getComments().add(savedComment);
        thread.setCommentCount(thread.getCommentCount() + 1);
        threadRepository.save(thread);

        return toDto(savedComment);
    }

    @Transactional
    public void reportComment(Long commentId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.isReported()) {
            comment.setReported(true);
            commentRepository.save(comment);
        }
    }


    @Transactional
    public CommentDto updateComment(Long commentId, Long userId, String body) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setBody(body);
        comment.setEditedAt(LocalDateTime.now());
        return toDto(commentRepository.save(comment));
    }


    @Transactional
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getAuthor().getId().equals(userId)) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }
        Thread thread = comment.getThread();

        thread.getComments().remove(comment);
        thread.setCommentCount(Math.max(0, thread.getCommentCount() - 1));
        threadRepository.save(thread);

        commentRepository.delete(comment);
    }




    private CommentDto toDto(Comment comment) {
        User user = comment.getAuthor();
        return CommentDto.builder()
                .id(comment.getId())
                .body(comment.getBody())
                .reported(comment.isReported())
                .createdAt(comment.getCreatedAt())
                .editedAt(comment.getEditedAt())
                .author(UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .userType(user.getUserType())
                        .build())
                .build();
    }

}
