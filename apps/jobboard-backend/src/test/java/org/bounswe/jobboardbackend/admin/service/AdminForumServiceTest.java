package org.bounswe.jobboardbackend.admin.service;

import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.service.ForumService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminForumServiceTest {

    @Mock
    private ForumService forumService;

    @InjectMocks
    private AdminForumService adminForumService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .id(1L)
                .username("admin")
                .email("admin@example.com")
                .build();
    }

    @Test
    void deletePost_Success_DelegatesToForumService() {
        adminForumService.deletePost(1L, adminUser, "Spam content");
        verify(forumService).deletePost(1L, adminUser);
    }

    @Test
    void deletePost_DelegateThrowsException() {
        doThrow(new HandleException(org.bounswe.jobboardbackend.exception.ErrorCode.NOT_FOUND, "Not found"))
                .when(forumService).deletePost(999L, adminUser);

        assertThrows(HandleException.class,
                () -> adminForumService.deletePost(999L, adminUser, "Test"));
    }

    @Test
    void deletePost_WithReason_ProcessesCorrectly() {
        String reason = "Policy violation - harassment";
        adminForumService.deletePost(1L, adminUser, reason);
        verify(forumService).deletePost(1L, adminUser);
    }

    @Test
    void deletePost_NullReason_StillDeletes() {
        adminForumService.deletePost(1L, adminUser, null);
        verify(forumService).deletePost(1L, adminUser);
    }

    @Test
    void deleteComment_Success_DeletesComment() {
        adminForumService.deleteComment(10L, adminUser, "Offensive content");
        verify(forumService).deleteComment(10L, adminUser);
    }

    @Test
    void deleteComment_NotFound_ThrowsException() {
        doThrow(new HandleException(org.bounswe.jobboardbackend.exception.ErrorCode.NOT_FOUND, "Not found"))
                .when(forumService).deleteComment(999L, adminUser);

        assertThrows(HandleException.class,
                () -> adminForumService.deleteComment(999L, adminUser, "Test"));
    }

    @Test
    void deleteComment_WithReason_ProcessesCorrectly() {
        String reason = "Spam";
        adminForumService.deleteComment(10L, adminUser, reason);
        verify(forumService).deleteComment(10L, adminUser);
    }

    @Test
    void deleteComment_DoesNotAffectPost() {
        adminForumService.deleteComment(10L, adminUser, "Spam");
        verify(forumService).deleteComment(10L, adminUser);
        verify(forumService, never()).deletePost(anyLong(), any());
    }

    @Test
    void deletePost_MultipleDeletions_AllSucceed() {
        adminForumService.deletePost(1L, adminUser, "Spam");
        adminForumService.deletePost(2L, adminUser, "Spam");
        verify(forumService).deletePost(1L, adminUser);
        verify(forumService).deletePost(2L, adminUser);
    }
}
