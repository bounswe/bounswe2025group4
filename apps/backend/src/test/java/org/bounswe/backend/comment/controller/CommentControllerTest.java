package org.bounswe.backend.comment.controller;

import org.bounswe.backend.comment.dto.CommentDto;
import org.bounswe.backend.comment.dto.CreateCommentRequestDto;
import org.bounswe.backend.comment.service.CommentService;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CommentControllerTest {

    @Mock
    private CommentService commentService;

    @InjectMocks
    private CommentController commentController;

    private AutoCloseable closeable;
    private User mockUser;
    private CommentController spiedController;
    private final LocalDateTime fixedNow = LocalDateTime.of(2025, 5, 12, 12, 0);


    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);

        mockUser = User.builder().id(1L).username("john").email("john@example.com").build();

        spiedController = spy(commentController);
        doReturn(mockUser).when(spiedController).getCurrentUser();
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void reportComment_success() {
        Long commentId = 1L;

        ResponseEntity<Void> response = spiedController.reportComment(commentId);

        assertEquals(200, response.getStatusCode().value());
        verify(commentService).reportComment(commentId);
    }

    @Test
    void updateComment_success() {
        Long commentId = 2L;
        CreateCommentRequestDto request = CreateCommentRequestDto.builder()
                .body("Updated content")
                .build();

        CommentDto expected = CommentDto.builder()
                .id(commentId)
                .body("Updated content")
                .createdAt(fixedNow)
                .reported(false)
                .author(UserDto.builder().id(1L).username("john").build())
                .build();

        when(commentService.updateComment(commentId, mockUser.getId(), request.getBody()))
                .thenReturn(expected);

        ResponseEntity<CommentDto> response = spiedController.updateComment(commentId, request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(expected.getBody(), response.getBody().getBody());
        verify(commentService).updateComment(commentId, mockUser.getId(), request.getBody());
    }

    @Test
    void deleteComment_success() {
        Long commentId = 3L;

        ResponseEntity<Void> response = spiedController.deleteComment(commentId);

        assertEquals(204, response.getStatusCode().value());
        verify(commentService).deleteComment(commentId, mockUser.getId());
    }
}
