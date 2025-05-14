package org.bounswe.backend.thread.controller;
import org.bounswe.backend.comment.dto.CommentDto;
import org.bounswe.backend.comment.dto.CreateCommentRequestDto;
import org.bounswe.backend.comment.service.CommentService;
import org.bounswe.backend.thread.dto.CreateThreadRequestDto;
import org.bounswe.backend.thread.dto.ThreadDto;
import org.bounswe.backend.thread.service.ThreadService;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.junit.jupiter.api.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ThreadControllerTest {

    @Mock
    private ThreadService threadService;



    @Mock
    private CommentService commentService;

    @InjectMocks
    private ThreadController threadController;

    private User mockUser;
    private AutoCloseable closeable;
    private LocalDateTime fixedNow;

    @BeforeEach
    void setUp() {
        closeable = MockitoAnnotations.openMocks(this);

        mockUser = User.builder()
                .id(1L)
                .username("john")
                .email("john@example.com")
                .build();

        fixedNow = LocalDateTime.of(2025, 5, 12, 12, 0);
    }

    @AfterEach
    void tearDown() throws Exception {
        closeable.close();
    }

    @Test
    void createThread_success() {
        ThreadController controller = spy(threadController);

        CreateThreadRequestDto requestDto = CreateThreadRequestDto.builder()
                .title("Thread Title")
                .body("This is the body of the thread.")
                .tags(List.of("java", "spring"))
                .build();

        ThreadDto expectedResponse = ThreadDto.builder()
                .id(101L)
                .title("Thread Title")
                .body("This is the body of the thread.")
                .creatorId(1L)
                .creatorUsername("john")
                .tags(List.of("java", "spring"))
                .reported(false)
                .createdAt(fixedNow)
                .editedAt(null)
                .commentCount(0)
                .build();

        doReturn(mockUser).when(controller).getCurrentUser();
        when(threadService.createThread(eq(mockUser.getId()), any(CreateThreadRequestDto.class)))
                .thenReturn(expectedResponse);

        ResponseEntity<ThreadDto> response = controller.createThread(requestDto);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(expectedResponse.getId(), response.getBody().getId());
        verify(threadService).createThread(mockUser.getId(), requestDto);
    }

    @Test
    void getThreadById_success() {
        Long threadId = 123L;
        ThreadDto mockThread = ThreadDto.builder()
                .id(threadId)
                .title("Test Title")
                .body("Test Body")
                .creatorId(1L)
                .creatorUsername("john")
                .tags(List.of("test"))
                .reported(false)
                .createdAt(fixedNow)
                .commentCount(0)
                .build();

        when(threadService.getThreadById(threadId)).thenReturn(mockThread);

        ResponseEntity<ThreadDto> response = threadController.getThreadById(threadId);

        assertEquals(200, response.getStatusCode().value());
        assertEquals(mockThread, response.getBody());
        verify(threadService, times(1)).getThreadById(threadId);
    }

    @Test
    void unlikeThread_success() {
        ThreadController controller = spy(threadController);
        doReturn(mockUser).when(controller).getCurrentUser();

        Long threadId = 456L;

        ResponseEntity<Void> response = controller.unlikeThread(threadId);

        assertEquals(204, response.getStatusCode().value());
        verify(threadService).unlikeThread(threadId, mockUser.getId());
    }

    @Test
    void addComment_success() {
        ThreadController controller = spy(threadController);
        doReturn(mockUser).when(controller).getCurrentUser();

        Long threadId = 789L;
        CreateCommentRequestDto request = CreateCommentRequestDto.builder()
                .body("This is a test comment")
                .build();

        CommentDto expectedComment = CommentDto.builder()
                .id(1L)
                .body("This is a test comment")
                .reported(false)
                .createdAt(fixedNow)
                .author(UserDto.builder().id(1L).username("john").build())
                .build();

        when(commentService.addCommentToThread(eq(threadId), eq(mockUser.getId()), any(CreateCommentRequestDto.class)))
                .thenReturn(expectedComment);

        ResponseEntity<CommentDto> response = controller.addComment(threadId, request);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(expectedComment.getBody(), response.getBody().getBody());
        verify(commentService).addCommentToThread(threadId, mockUser.getId(), request);
    }

    @Test
    void getLikers_success() {
        Long threadId = 789L;
        List<UserDto> mockLikers = List.of(
                UserDto.builder().id(1L).username("john").build(),
                UserDto.builder().id(2L).username("jane").build()
        );

        when(threadService.getLikers(threadId)).thenReturn(mockLikers);

        ResponseEntity<List<UserDto>> response = threadController.getLikers(threadId);

        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("john", response.getBody().get(0).getUsername());
        verify(threadService, times(1)).getLikers(threadId);
    }
}