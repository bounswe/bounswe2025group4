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

    public CommentDto addCommentToThread(Long threadId, Long userId, CreateCommentRequestDto dto) {
        Thread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new RuntimeException("Thread not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .body(dto.getBody())
                .author(user)
                .thread(thread)
                .build();

        Comment saved = commentRepository.save(comment);

        return CommentDto.builder()
                .id(saved.getId())
                .body(saved.getBody())
                .author(UserDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .bio(user.getBio())
                        .userType(user.getUserType())
                        .build())
                .build();
    }
}
