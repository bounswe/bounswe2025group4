package org.bounswe.backend.comment.controller;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.bounswe.backend.comment.dto.CommentDto;
import org.bounswe.backend.comment.dto.CreateCommentRequestDto;
import org.bounswe.backend.comment.service.CommentService;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/comments")
@Tag(name = "Comments", description = "Endpoints for discussion comments")
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;


    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;

    }

    @PostMapping("/{commentId}/report")
    public ResponseEntity<Void> reportComment(@PathVariable Long commentId) {
        commentService.reportComment(commentId);
        return ResponseEntity.ok().build();
    }


    @PatchMapping("/{commentId}")
    public ResponseEntity<CommentDto> updateComment(@PathVariable Long commentId,
                                                    @RequestBody @Valid CreateCommentRequestDto request) {
        User user = getCurrentUser();
        CommentDto updated = commentService.updateComment(commentId, user.getId(), request.getBody());
        return ResponseEntity.ok(updated);
    }



    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        User user = getCurrentUser();
        commentService.deleteComment(commentId, user.getId());
        return ResponseEntity.noContent().build();
    }



    User getCurrentUser() {
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
