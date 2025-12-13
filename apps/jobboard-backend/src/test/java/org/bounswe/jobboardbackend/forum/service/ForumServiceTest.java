package org.bounswe.jobboardbackend.forum.service;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.dto.CreateCommentRequest;
import org.bounswe.jobboardbackend.forum.dto.CreatePostRequest;
import org.bounswe.jobboardbackend.forum.dto.PostResponse;
import org.bounswe.jobboardbackend.forum.dto.UpdatePostRequest;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentDownvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostDownvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostUpvoteRepository;
import org.bounswe.jobboardbackend.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ForumServiceTest {

    @Mock
    private ForumPostRepository postRepository;

    @Mock
    private ForumCommentRepository commentRepository;

    @Mock
    private ForumCommentUpvoteRepository upvoteRepository;

    @Mock
    private ForumCommentDownvoteRepository downvoteRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private ForumPostUpvoteRepository postUpvoteRepository;

    @Mock
    private ForumPostDownvoteRepository postDownvoteRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ForumService forumService;

    private User user;
    private ForumPost post;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("testuser");
        user.setRole(Role.ROLE_JOBSEEKER);

        post = ForumPost.builder()
                .id(1L)
                .title("Test Post")
                .content("Content")
                .author(user)
                .build();
    }

    @Test
    void createPost_ShouldReturnPostResponse() {
        CreatePostRequest request = new CreatePostRequest();
        request.setTitle("Test Post");
        request.setContent("Content");

        when(postRepository.save(any(ForumPost.class))).thenReturn(post);

        PostResponse response = forumService.createPost(user, request);

        assertNotNull(response);
        assertEquals("Test Post", response.getTitle());
        verify(postRepository).save(any(ForumPost.class));
    }

    @Test
    void findAllPosts_ShouldReturnListOfPosts() {
        when(postRepository.findAll()).thenReturn(List.of(post));

        List<PostResponse> responses = forumService.findAllPosts();

        assertFalse(responses.isEmpty());
        assertEquals(1, responses.size());
    }

    @Test
    void findPostById_ShouldReturnPost_WhenFound() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        PostResponse response = forumService.findPostById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
    }

    @Test
    void findPostById_ShouldThrowException_WhenNotFound() {
        when(postRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(HandleException.class, () -> forumService.findPostById(1L));
    }

    @Test
    void updatePost_ShouldUpdatePost_WhenAuthorized() {
        UpdatePostRequest request = new UpdatePostRequest();
        request.setTitle("Updated Title");

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postRepository.save(any(ForumPost.class))).thenReturn(post);

        PostResponse response = forumService.updatePost(1L, user, request);

        assertNotNull(response);
        verify(postRepository).save(post);
    }

    @Test
    void updatePost_ShouldThrowException_WhenUnauthorized() {
        User otherUser = new User();
        otherUser.setId(2L);

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        assertThrows(HandleException.class, () -> forumService.updatePost(1L, otherUser, new UpdatePostRequest()));
    }

    @Test
    void deletePost_ShouldDeletePost_WhenAuthorized() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        forumService.deletePost(1L, user);

        verify(postRepository).delete(post);
    }

    @Test
    void createComment_ShouldCreateComment_WhenRateLimitNotExceeded() {
        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Test Comment");

        ForumComment savedComment = ForumComment.builder()
                .id(1L)
                .content("Test Comment")
                .author(user)
                .post(post)
                .build();

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(commentRepository.countByAuthorIdAndPostIdAndCreatedAtAfter(anyLong(), anyLong(), any(Instant.class)))
                .thenReturn(0L);
        when(commentRepository.save(any(ForumComment.class))).thenReturn(savedComment);

        forumService.createComment(1L, user, request);

        verify(commentRepository).save(any(ForumComment.class));
    }

    @Test
    void createComment_ShouldThrowException_WhenRateLimitExceeded() {
        CreateCommentRequest request = new CreateCommentRequest();
        request.setContent("Test Comment");

        when(commentRepository.countByAuthorIdAndPostIdAndCreatedAtAfter(anyLong(), anyLong(), any(Instant.class)))
                .thenReturn(5L);

        assertThrows(HandleException.class, () -> forumService.createComment(1L, user, request));
    }
}
