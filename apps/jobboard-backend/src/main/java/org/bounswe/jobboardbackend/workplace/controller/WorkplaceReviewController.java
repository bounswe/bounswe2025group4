package org.bounswe.jobboardbackend.workplace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.ReviewService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workplace/{workplaceId}")
@RequiredArgsConstructor
public class WorkplaceReviewController {

    private final ReviewService reviewService;
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

    // === REVIEWS ===
    @PostMapping("/review")
    public ResponseEntity<ReviewResponse> create(@PathVariable Long workplaceId,
                                                 @RequestBody @Valid ReviewCreateRequest req) {
        var res = reviewService.createReview(workplaceId, req, currentUser());
        return ResponseEntity.ok(res);
    }

    @GetMapping("/review")
    public ResponseEntity<PaginatedResponse<ReviewResponse>> list(@PathVariable Long workplaceId,
                                                                  @RequestParam(defaultValue = "0") int page,
                                                                  @RequestParam(defaultValue = "10") int size,
                                                                  @RequestParam(required = false) String rating,
                                                                  @RequestParam(required = false) String sortBy,
                                                                  @RequestParam(required = false) Boolean hasComment,
                                                                  @RequestParam(required = false) String policy,
                                                                  @RequestParam(required = false) Integer policyMin) {
        var res = reviewService.listReviews(workplaceId, page, size, rating, sortBy, hasComment, policy, policyMin);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/review/{reviewId}")
    public ResponseEntity<ReviewResponse> getOne(@PathVariable Long workplaceId,
                                                 @PathVariable Long reviewId) {
        return ResponseEntity.ok(reviewService.getOne(workplaceId, reviewId));
    }

    @PutMapping("/review/{reviewId}")
    public ResponseEntity<ReviewResponse> update(@PathVariable Long workplaceId,
                                                 @PathVariable Long reviewId,
                                                 @RequestBody @Valid ReviewUpdateRequest req) {
        var res = reviewService.updateReview(workplaceId, reviewId, req, currentUser());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/review/{reviewId}")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long workplaceId,
                                             @PathVariable Long reviewId) {
        // Admin kontrolünü Security tarafında yapıyorsan, burada "isAdmin" false geçebilirsin veya role bakıp true set edebilirsin
        boolean isAdmin = false; // gerekirse role check ekle
        reviewService.deleteReview(workplaceId, reviewId, currentUser(), isAdmin);
        return ResponseEntity.ok(ApiMessage.builder().message("Review deleted").code("REVIEW_DELETED").build());
    }

}
