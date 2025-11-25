package org.bounswe.jobboardbackend.workplace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.EmployerService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workplace")
@RequiredArgsConstructor
public class WorkplaceEmployerController {

    private final EmployerService employerService;
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
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if ("ROLE_ADMIN".equals(ga.getAuthority())) return true;
        }
        return false;
    }

    // === LIST EMPLOYERS ===
    @GetMapping("/{workplaceId}/employers")
    public ResponseEntity<List<EmployerListItem>> listEmployers(@PathVariable Long workplaceId) {
        return ResponseEntity.ok(employerService.listEmployers(workplaceId));
    }

    // === LIST WORKPLACES OF EMPLOYER ===
    @GetMapping("/employers/me")
    public ResponseEntity<List<EmployerWorkplaceBrief>> myWorkplaces() {
        var user = currentUser();
        return ResponseEntity.ok(employerService.listWorkplacesOfEmployer(user.getId()));
    }

    // === REQUESTS ===
    @GetMapping("/{workplaceId}/employers/request")
    public ResponseEntity<PaginatedResponse<EmployerRequestResponse>> listRequests(@PathVariable Long workplaceId,
                                                                                   @RequestParam(defaultValue = "0") int page,
                                                                                   @RequestParam(defaultValue = "10") int size) {
        var user = currentUser();
        var res = employerService.listRequests(workplaceId, page, size, user.getId(), isAdmin());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{workplaceId}/employers/request")
    public ResponseEntity<ApiMessage> createRequest(@PathVariable Long workplaceId,
                                                    @RequestBody @Valid EmployerRequestCreate req) {
        var user = currentUser(); // başvuru yapan
        employerService.createRequest(workplaceId, req, user.getId());
        return ResponseEntity.ok(
                ApiMessage.builder()
                        .message("Employer request created")
                        .code("EMPLOYER_REQUEST_CREATED")
                        .build()
        );
    }

    @GetMapping("/{workplaceId}/employers/request/{requestId}")
    public ResponseEntity<EmployerRequestResponse> getRequest(@PathVariable Long workplaceId,
                                                              @PathVariable Long requestId) {
        var user = currentUser();
        var res = employerService.getRequest(workplaceId, requestId, user.getId(), isAdmin());
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{workplaceId}/employers/request/{requestId}")
    public ResponseEntity<ApiMessage> resolve(@PathVariable Long workplaceId,
                                              @PathVariable Long requestId,
                                              @RequestBody @Valid EmployerRequestResolve req) {
        var user = currentUser();
        employerService.resolveRequest(workplaceId, requestId, req, user.getId(), isAdmin());
        return ResponseEntity.ok(ApiMessage.builder().message("Employer request resolved").code("EMPLOYER_REQUEST_RESOLVED").build());
    }

    @DeleteMapping("/{workplaceId}/employers/{employerId}")
    public ResponseEntity<ApiMessage> removeEmployer(@PathVariable Long workplaceId,
                                                     @PathVariable Long employerId) {
        var user = currentUser();
        employerService.removeEmployer(workplaceId, employerId, user.getId(), isAdmin());
        return ResponseEntity.ok(ApiMessage.builder().message("Employer removed").code("EMPLOYER_REMOVED").build());
    }

    // === LIST MY EMPLOYER REQUESTS  ===
    @GetMapping("/employers/requests/me")
    public ResponseEntity<PaginatedResponse<EmployerRequestResponse>> myRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        var user = currentUser();
        var res = employerService.listMyRequests(user.getId(), page, size);
        return ResponseEntity.ok(res);
    }
}
