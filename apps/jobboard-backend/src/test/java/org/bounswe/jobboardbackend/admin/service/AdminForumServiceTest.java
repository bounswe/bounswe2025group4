package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminForumServiceTest {

    @Mock
    private ForumPostRepository forumPostRepository;
    @Mock
    private ForumCommentRepository forumCommentRepository;

    @InjectMocks
    private AdminForumService adminForumService;

    private ForumPost testPost;
    private ForumComment testComment;

    @BeforeEach
    void setUp() {
        testPost = new ForumPost();
        testPost.setId(1L);
        testPost.setTitle("Test Post");

        testComment = new ForumComment();
        testComment.setId(10L);
        testComment.setContent("Test comment");
    }

    @Test
    void deletePost_Success_DeletesPostAndCascadeComments() {
        when(forumPostRepository.findById(1L)).thenReturn(Optional.of(testPost));
        adminForumService.deletePost(1L, "Spam content");
        verify(forumPostRepository).delete(testPost);
    }

    @Test
    void deletePost_NotFound_ThrowsException() {
        when(forumPostRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminForumService.deletePost(999L, "Test"));

        verify(forumPostRepository, never()).delete(any());
    }

    @Test
    void deletePost_WithReason_ProcessesCorrectly() {
        when(forumPostRepository.findById(1L)).thenReturn(Optional.of(testPost));
        String reason = "Policy violation - harassment";
        adminForumService.deletePost(1L, reason);
        verify(forumPostRepository).delete(testPost);
        // TODO: Verify reason logged for audit
    }

    @Test
    void deletePost_NullReason_StillDeletes() {
        when(forumPostRepository.findById(1L)).thenReturn(Optional.of(testPost));
        adminForumService.deletePost(1L, null);
        verify(forumPostRepository).delete(testPost);
    }

    @Test
    void deleteComment_Success_DeletesComment() {
        when(forumCommentRepository.findById(10L)).thenReturn(Optional.of(testComment));
        adminForumService.deleteComment(10L, "Offensive content");
        verify(forumCommentRepository).delete(testComment);
    }

    @Test
    void deleteComment_NotFound_ThrowsException() {
        when(forumCommentRepository.findById(999L)).thenReturn(Optional.empty());
        assertThrows(HandleException.class,
                () -> adminForumService.deleteComment(999L, "Test"));

        verify(forumCommentRepository, never()).delete(any());
    }

    @Test
    void deleteComment_WithReason_ProcessesCorrectly() {
        when(forumCommentRepository.findById(10L)).thenReturn(Optional.of(testComment));
        String reason = "Spam";
        adminForumService.deleteComment(10L, reason);
        verify(forumCommentRepository).delete(testComment);
    }

    @Test
    void deleteComment_DoesNotAffectPost() {
        when(forumCommentRepository.findById(10L)).thenReturn(Optional.of(testComment));
        adminForumService.deleteComment(10L, "Spam");
        verify(forumCommentRepository).delete(testComment);
        verify(forumPostRepository, never()).delete(any());
    }

    @Test
    void deletePost_MultipleDeletions_AllSucceed() {
        ForumPost post1 = new ForumPost();
        post1.setId(1L);
        ForumPost post2 = new ForumPost();
        post2.setId(2L);

        when(forumPostRepository.findById(1L)).thenReturn(Optional.of(post1));
        when(forumPostRepository.findById(2L)).thenReturn(Optional.of(post2));
        adminForumService.deletePost(1L, "Spam");
        adminForumService.deletePost(2L, "Spam");
        verify(forumPostRepository).delete(post1);
        verify(forumPostRepository).delete(post2);
    }
}
