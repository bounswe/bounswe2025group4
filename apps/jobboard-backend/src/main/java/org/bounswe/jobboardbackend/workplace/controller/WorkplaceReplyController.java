package org.bounswe.jobboardbackend.workplace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.ReplyService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workplace")
@RequiredArgsConstructor
public class WorkplaceReplyController {

    private final ReplyService replyService;
    private final UserRepository userRepository;

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) throw new AccessDeniedException("Unauthenticated");
        Object principal = auth.getPrincipal();
        if (principal instanceof User u) return u;
        if (principal instanceof UserDetails ud) {
            String key = ud.getUsername();
            return userRepository.findByEmail(key).or(() -> userRepository.findByUsername(key))
                    .orElseThrow(() -> new AccessDeniedException("User not found for principal: " + key));
        }
        String name = auth.getName();
        return userRepository.findByEmail(name).or(() -> userRepository.findByUsername(name))
                .orElseThrow(() -> new AccessDeniedException("User not found for name: " + name));
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @GetMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ReplyResponse> getReply(@PathVariable Long workplaceId, @PathVariable Long reviewId) {
        var res = replyService.getReply(workplaceId, reviewId);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ReplyResponse> createReply(@PathVariable Long workplaceId,
                                                     @PathVariable Long reviewId,
                                                     @RequestBody @Valid ReplyCreateRequest req) {
        var user = currentUser();
        var res = replyService.createReply(workplaceId, reviewId, req, user.getId(), isAdmin());
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ReplyResponse> updateReply(@PathVariable Long workplaceId,
                                                     @PathVariable Long reviewId,
                                                     @RequestBody @Valid ReplyUpdateRequest req) {
        var user = currentUser();
        var res = replyService.updateReply(workplaceId, reviewId, req, user.getId(), isAdmin());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{workplaceId}/review/{reviewId}/reply")
    public ResponseEntity<ApiMessage> deleteReply(@PathVariable Long workplaceId,
                                                  @PathVariable Long reviewId) {
        var user = currentUser();
        replyService.deleteReply(workplaceId, reviewId, user.getId(), isAdmin());
        return ResponseEntity.ok(ApiMessage.builder().message("Reply deleted").code("REPLY_DELETED").build());
    }
}
