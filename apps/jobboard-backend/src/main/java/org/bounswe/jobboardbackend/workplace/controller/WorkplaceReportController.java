package org.bounswe.jobboardbackend.workplace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.ReportService;
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
public class WorkplaceReportController {

    private final ReportService reportService;
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

    @PostMapping("/{id}/report")
    public ResponseEntity<ApiMessage> reportWorkplace(@PathVariable Long id,
                                                      @RequestBody @Valid WorkplaceReportCreate req) {
        reportService.reportWorkplace(id, req, currentUser());
        return ResponseEntity.ok(ApiMessage.builder().message("Workplace reported").code("WORKPLACE_REPORTED").build());
    }

    @PostMapping("/{id}/review/{reviewId}/report")
    public ResponseEntity<ApiMessage> reportReview(@PathVariable Long id,
                                                   @PathVariable Long reviewId,
                                                   @RequestBody @Valid ReviewReportCreate req) {
        reportService.reportReview(id, reviewId, req, currentUser());
        return ResponseEntity.ok(ApiMessage.builder().message("Review reported").code("REVIEW_REPORTED").build());
    }
}
