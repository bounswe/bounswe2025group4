package org.bounswe.backend.thread.controller;

import jakarta.validation.Valid;
import org.bounswe.backend.comment.dto.CommentDto;
import org.bounswe.backend.comment.dto.CreateCommentRequestDto;
import org.bounswe.backend.comment.service.CommentService;
import org.bounswe.backend.tag.service.TagService;
import org.bounswe.backend.tag.entity.Tag;
import org.bounswe.backend.thread.dto.CreateThreadRequestDto;
import org.bounswe.backend.thread.dto.ThreadDto;
import org.bounswe.backend.thread.dto.UpdateThreadRequestDto;
import org.bounswe.backend.thread.service.ThreadService;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/threads")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Threads", description = "Discussion thread endpoints")
public class ThreadController {

    private final ThreadService threadService;
    private final UserRepository userRepository;
    private final TagService tagService;
    private final CommentService commentService;

    public ThreadController(ThreadService threadService, UserRepository userRepository, TagService tagService, CommentService commentService) {
        this.threadService = threadService;
        this.userRepository = userRepository;
        this.tagService = tagService;
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<ThreadDto>> getAllThreads() {
        return ResponseEntity.ok(threadService.getAllThreads());
    }

    @PostMapping
    public ResponseEntity<ThreadDto> createThread(@Valid @RequestBody CreateThreadRequestDto request) {
        User user = getCurrentUser();
        return ResponseEntity.ok(threadService.createThread(user.getId(), request));
    }

    @GetMapping("/{threadId}")
    public ResponseEntity<ThreadDto> getThreadById(@PathVariable Long threadId) {
        ThreadDto thread = threadService.getThreadById(threadId);
        return ResponseEntity.ok(thread);
    }

    @PatchMapping("/{threadId}")
    public ResponseEntity<ThreadDto> updateThread(@PathVariable Long threadId,
                                                  @Valid @RequestBody UpdateThreadRequestDto dto) {
        User user = getCurrentUser();
        ThreadDto updated = threadService.updateThread(threadId, user.getId(), dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{threadId}")
    public ResponseEntity<Void> deleteThread(@PathVariable Long threadId) {
        User user = getCurrentUser();
        threadService.deleteThread(threadId, user.getId());
        return ResponseEntity.noContent().build();
    }



    @PostMapping("/{threadId}/like")
    public ResponseEntity<Void> likeThread(@PathVariable Long threadId) {
        User user = getCurrentUser();
        threadService.likeThread(threadId, user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{threadId}/like")
    public ResponseEntity<Void> unlikeThread(@PathVariable Long threadId) {
        User user = getCurrentUser();
        threadService.unlikeThread(threadId, user.getId());
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/{id}/likers")
    public ResponseEntity<List<UserDto>> getLikers(@PathVariable Long id) {
        return ResponseEntity.ok(threadService.getLikers(id));
    }



    @PostMapping("/{threadId}/report")
    public ResponseEntity<Void> reportThread(@PathVariable Long threadId) {
        threadService.reportThread(threadId);
        return ResponseEntity.ok().build();
    }



    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAvailableTags() {
        return ResponseEntity.ok(tagService.getAllTagNames());
    }

    @PostMapping("/tags")
    public ResponseEntity<Tag> createTag(@RequestBody Map<String, String> payload) {
        Tag tag = tagService.findOrCreateTag(payload.get("name"));
        return ResponseEntity.ok(tag);
    }


    @GetMapping("/{threadId}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable Long threadId) {
        List<CommentDto> comments = commentService.getCommentsByThreadId(threadId);
        return ResponseEntity.ok(comments);
    }


    @PostMapping("/{threadId}/comments")
    public ResponseEntity<CommentDto> addComment(@PathVariable Long threadId,
                                                 @Valid @RequestBody CreateCommentRequestDto request) {
        User user = getCurrentUser();
        CommentDto created = commentService.addCommentToThread(threadId, user.getId(), request);
        return ResponseEntity.ok(created);
    }


    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String getCurrentUsername() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new RuntimeException("Invalid authentication context");
    }
}
