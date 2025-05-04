package org.bounswe.backend.thread.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.bounswe.backend.tag.service.TagService;
import org.bounswe.backend.thread.dto.CreateThreadRequestDto;
import org.bounswe.backend.thread.dto.ThreadDto;
import org.bounswe.backend.thread.service.ThreadService;
import org.bounswe.backend.user.dto.UserDto;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/threads")
@Tag(name = "Threads", description = "Discussion thread endpoints")
public class ThreadController {

    private final ThreadService threadService;
    private final UserRepository userRepository;
    private final TagService tagService;

    public ThreadController(ThreadService threadService, UserRepository userRepository, TagService tagService) {
        this.threadService = threadService;
        this.userRepository = userRepository;
        this.tagService = tagService;
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


    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAvailableTags() {
        return ResponseEntity.ok(tagService.getAllTagNames());
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
