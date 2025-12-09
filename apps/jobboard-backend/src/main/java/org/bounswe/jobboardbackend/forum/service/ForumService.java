package org.bounswe.jobboardbackend.forum.service;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.dto.*;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumCommentDownvote;
import org.bounswe.jobboardbackend.forum.model.ForumCommentUpvote;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentDownvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.notification.model.NotificationType;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumPostRepository postRepository;
    private final ForumCommentRepository commentRepository;
    private final ForumCommentUpvoteRepository upvoteRepository;
    private final ForumCommentDownvoteRepository downvoteRepository;
    private final NotificationService notificationService;

    @Transactional
    public PostResponse createPost(User author, CreatePostRequest request) {
        ForumPost post = ForumPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .tags(request.getTags())
                .build();

        ForumPost savedPost = postRepository.save(post);
        return PostResponse.from(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findAllPosts() {
        return postRepository.findAll().stream()
                .map(PostResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse findPostById(Long id) {
        ForumPost post = postRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse updatePost(Long id, User user, UpdatePostRequest request) {
        ForumPost post = postRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));

        if (!post.getAuthor().getId().equals(user.getId())) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "You are not authorized to update this post");
        }

        if (request.getTitle() != null) {
            post.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            post.setContent(request.getContent());
        }
        if (request.getTags() != null) {
            post.setTags(request.getTags());
        }

        ForumPost updatedPost = postRepository.save(post);
        return PostResponse.from(updatedPost);
    }

    @Transactional
    public void deletePost(Long id, User user) {
        ForumPost post = postRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        if (!post.getAuthor().getId().equals(user.getId()) && !isAdmin) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "You are not authorized to delete this post");
        }

        postRepository.delete(post);
    }

    @Transactional
    public CommentResponse createComment(Long postId, User author, CreateCommentRequest request) {
        checkRateLimit(author, postId);

        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));

        ForumComment parentComment = null;
        if (request.getParentCommentId() != null) {
            parentComment = commentRepository.findById(request.getParentCommentId())
                    .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Parent comment not found"));
        }

        ForumComment comment = ForumComment.builder()
                .content(request.getContent())
                .author(author)
                .post(post)
                .parentComment(parentComment)
                .build();

        ForumComment savedComment = commentRepository.save(comment);

        notificationService.notifyUser(post.getAuthor().getUsername(), "NEW COMMENT from " + author.getUsername(), NotificationType.FORUM_COMMENT, request.getContent(), postId);

        return CommentResponse.from(savedComment, 0, 0);
    }

    private void checkRateLimit(User author, Long postId) {
        Instant oneHourAgo = Instant.now().minus(1, java.time.temporal.ChronoUnit.HOURS);
        long commentCount = commentRepository.countByAuthorIdAndPostIdAndCreatedAtAfter(author.getId(), postId,
                oneHourAgo);
        if (commentCount >= 5) {
            throw new HandleException(ErrorCode.ACCESS_DENIED,
                    "Rate limit exceeded: You can only post 5 comments per thread per hour.");
        }
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, User user, UpdateCommentRequest request) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "You are not authorized to update this comment");
        }

        comment.setContent(request.getContent());
        ForumComment updatedComment = commentRepository.save(comment);
        return toCommentResponse(updatedComment);
    }

    @Transactional
    public void deleteComment(Long commentId, User user) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Comment not found"));

        boolean isAdmin = user.getRole() == Role.ROLE_ADMIN;
        if (!comment.getAuthor().getId().equals(user.getId()) && !isAdmin) {
            throw new HandleException(ErrorCode.ACCESS_DENIED, "You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }

    @Transactional
    public void upvoteComment(Long commentId, User user) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Comment not found"));

        if (upvoteRepository.findByUserIdAndCommentId(user.getId(), commentId).isPresent()) {
            return; // Already upvoted
        }

        // Remove downvote if exists
        downvoteRepository.findByUserIdAndCommentId(user.getId(), commentId)
                .ifPresent(downvoteRepository::delete);

        ForumCommentUpvote upvote = ForumCommentUpvote.builder()
                .user(user)
                .comment(comment)
                .build();
        upvoteRepository.save(upvote);
    }

    @Transactional
    public void removeUpvote(Long commentId, User user) {
        upvoteRepository.findByUserIdAndCommentId(user.getId(), commentId)
                .ifPresent(upvoteRepository::delete);
    }

    @Transactional
    public void downvoteComment(Long commentId, User user) {
        ForumComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Comment not found"));

        if (downvoteRepository.findByUserIdAndCommentId(user.getId(), commentId).isPresent()) {
            return; // Already downvoted
        }

        // Remove upvote if exists
        upvoteRepository.findByUserIdAndCommentId(user.getId(), commentId)
                .ifPresent(upvoteRepository::delete);

        ForumCommentDownvote downvote = ForumCommentDownvote.builder()
                .user(user)
                .comment(comment)
                .build();
        downvoteRepository.save(downvote);
    }

    @Transactional
    public void removeDownvote(Long commentId, User user) {
        downvoteRepository.findByUserIdAndCommentId(user.getId(), commentId)
                .ifPresent(downvoteRepository::delete);
    }

    private CommentResponse toCommentResponse(ForumComment comment) {
        long upvotes = upvoteRepository.countByCommentId(comment.getId());
        long downvotes = downvoteRepository.countByCommentId(comment.getId());
        return CommentResponse.from(comment, upvotes, downvotes);
    }
}
