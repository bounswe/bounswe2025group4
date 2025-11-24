package org.bounswe.jobboardbackend.forum.controller;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.forum.dto.*;
import org.bounswe.jobboardbackend.forum.service.ForumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
public class ForumController {

    private final ForumService forumService;
    private final UserRepository userRepository;

    private User getUser(UserDetails userDetails) {
        String username = userDetails.getUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    @PostMapping("/posts")
    public ResponseEntity<PostResponse> createPost(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreatePostRequest request) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createPost(user, request));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostResponse>> findAllPosts() {
        return ResponseEntity.ok(forumService.findAllPosts());
    }

    @GetMapping("/posts/{id}")
    public ResponseEntity<PostResponse> findPostById(@PathVariable Long id) {
        return ResponseEntity.ok(forumService.findPostById(id));
    }

    @PutMapping("/posts/{id}")
    public ResponseEntity<PostResponse> updatePost(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdatePostRequest request) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(forumService.updatePost(id, user, request));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        forumService.deletePost(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/posts/{id}/comments")
    public ResponseEntity<CommentResponse> createComment(@PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CreateCommentRequest request) {
        User user = getUser(userDetails);
        return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createComment(id, user, request));
    }

    @PutMapping("/comments/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails, @RequestBody UpdateCommentRequest request) {
        User user = getUser(userDetails);
        return ResponseEntity.ok(forumService.updateComment(commentId, user, request));
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        forumService.deleteComment(commentId, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comments/{commentId}/upvote")
    public ResponseEntity<Void> upvoteComment(@PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        forumService.upvoteComment(commentId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{commentId}/upvote")
    public ResponseEntity<Void> removeUpvote(@PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        forumService.removeUpvote(commentId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/comments/{commentId}/downvote")
    public ResponseEntity<Void> downvoteComment(@PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        forumService.downvoteComment(commentId, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/comments/{commentId}/downvote")
    public ResponseEntity<Void> removeDownvote(@PathVariable Long commentId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = getUser(userDetails);
        forumService.removeDownvote(commentId, user);
        return ResponseEntity.ok().build();
    }
}
