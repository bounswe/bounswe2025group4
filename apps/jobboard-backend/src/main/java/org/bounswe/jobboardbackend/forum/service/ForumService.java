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
import org.bounswe.jobboardbackend.forum.model.ForumPostDownvote;
import org.bounswe.jobboardbackend.forum.model.ForumPostUpvote;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentDownvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostDownvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostUpvoteRepository;
import org.bounswe.jobboardbackend.badge.event.CommentCreatedEvent;
import org.bounswe.jobboardbackend.badge.event.CommentUpvotedEvent;
import org.bounswe.jobboardbackend.badge.event.ForumPostCreatedEvent;
import org.bounswe.jobboardbackend.notification.notifier.ForumNotifier;
import org.bounswe.jobboardbackend.activity.service.ActivityService;
import org.bounswe.jobboardbackend.activity.model.ActivityType;
import org.springframework.context.ApplicationEventPublisher;
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
    private final ApplicationEventPublisher eventPublisher;
    private final ForumPostUpvoteRepository postUpvoteRepository;
    private final ForumPostDownvoteRepository postDownvoteRepository;
    private final ForumNotifier notifier;
    private final ActivityService activityService;

    @Transactional
    public PostResponse createPost(User author, CreatePostRequest request) {
        ForumPost post = ForumPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .author(author)
                .tags(request.getTags())
                .build();

        ForumPost savedPost = postRepository.save(post);

        // Publish event for badge checking
        eventPublisher.publishEvent(new ForumPostCreatedEvent(author.getId(), savedPost.getId()));

        activityService.logActivity(author, ActivityType.CREATE_THREAD, savedPost.getId(), "ForumPost");

        return toPostResponse(savedPost);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findAllPosts() {
        return findAllPosts(null);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findAllPosts(Long currentUserId) {
        return postRepository.findAll().stream()
                .map(post -> toPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findPostsByUserId(Long userId) {
        return findPostsByUserId(userId, null);
    }

    @Transactional(readOnly = true)
    public List<PostResponse> findPostsByUserId(Long userId, Long currentUserId) {
        return postRepository.findAllByAuthorIdOrderByCreatedAtDesc(userId).stream()
                .map(post -> toPostResponse(post, currentUserId))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostResponse findPostById(Long id) {
        return findPostById(id, null);
    }

    @Transactional(readOnly = true)
    public PostResponse findPostById(Long id, Long currentUserId) {
        ForumPost post = postRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));
        return toPostResponse(post, currentUserId);
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

        activityService.logActivity(user, ActivityType.EDIT_THREAD, updatedPost.getId(), "ForumPost");

        return toPostResponse(updatedPost);
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

        activityService.logActivity(user, ActivityType.DELETE_THREAD, id, "ForumPost");
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

        notifier.notifyNewComment(post, savedComment);

        // Publish event for badge checking
        eventPublisher.publishEvent(new CommentCreatedEvent(author.getId(), savedComment.getId(), postId));

        activityService.logActivity(author, ActivityType.CREATE_COMMENT, savedComment.getId(), "ForumComment");

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

        // Publish event for badge checking (for the comment author, not the voter)
        eventPublisher.publishEvent(new CommentUpvotedEvent(comment.getAuthor().getId(), commentId));
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
        return toCommentResponse(comment, null);
    }

    private CommentResponse toCommentResponse(ForumComment comment, Long userId) {
        long upvotes = upvoteRepository.countByCommentId(comment.getId());
        long downvotes = downvoteRepository.countByCommentId(comment.getId());
        return CommentResponse.from(comment, upvotes, downvotes, userId, upvoteRepository, downvoteRepository);
    }

    private PostResponse toPostResponse(ForumPost post) {
        return toPostResponse(post, null);
    }

    private PostResponse toPostResponse(ForumPost post, Long userId) {
        long upvotes = postUpvoteRepository.countByPostId(post.getId());
        long downvotes = postDownvoteRepository.countByPostId(post.getId());
        List<CommentResponse> comments = post.getComments().stream()
                .map(comment -> toCommentResponse(comment, userId))
                .collect(Collectors.toList());
        return PostResponse.from(post, upvotes, downvotes, comments, userId, postUpvoteRepository, postDownvoteRepository);
    }

    @Transactional
    public void upvotePost(Long postId, User user) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));

        if (postUpvoteRepository.findByUserIdAndPostId(user.getId(), postId).isPresent()) {
            return;
        }

        postDownvoteRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(postDownvoteRepository::delete);

        ForumPostUpvote upvote = ForumPostUpvote.builder()
                .user(user)
                .post(post)
                .build();
        postUpvoteRepository.save(upvote);

        activityService.logActivity(user, ActivityType.UPVOTE_THREAD, postId, "ForumPost");
    }

    @Transactional
    public void removePostUpvote(Long postId, User user) {
        postUpvoteRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(postUpvoteRepository::delete);
    }

    @Transactional
    public void downvotePost(Long postId, User user) {
        ForumPost post = postRepository.findById(postId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Post not found"));

        if (postDownvoteRepository.findByUserIdAndPostId(user.getId(), postId).isPresent()) {
            return;
        }

        postUpvoteRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(postUpvoteRepository::delete);

        ForumPostDownvote downvote = ForumPostDownvote.builder()
                .user(user)
                .post(post)
                .build();
        postDownvoteRepository.save(downvote);

        activityService.logActivity(user, ActivityType.DOWNVOTE_THREAD, postId, "ForumPost");
    }

    @Transactional
    public void removePostDownvote(Long postId, User user) {
        postDownvoteRepository.findByUserIdAndPostId(user.getId(), postId)
                .ifPresent(postDownvoteRepository::delete);
    }

    @Transactional
    public void deleteUserData(Long userId) {
        // Delete votes
        postUpvoteRepository.deleteByUserId(userId);
        postDownvoteRepository.deleteByUserId(userId);
        upvoteRepository.deleteByUserId(userId);
        downvoteRepository.deleteByUserId(userId);

        // Delete comments
        commentRepository.deleteByAuthorId(userId);

        // Delete posts (cascades to comments on that post)
        postRepository.deleteByAuthorId(userId);
    }
}
