package org.bounswe.jobboardbackend.workplace.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/workplace")
@RequiredArgsConstructor
public class WorkplaceController {

    private final WorkplaceService workplaceService;
    private final UserRepository userRepository;

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Unauthenticated");
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof User u) {
            return u;
        }
        if (principal instanceof UserDetails ud) {
            String key = ud.getUsername();
            return userRepository.findByEmail(key)
                    .or(() -> userRepository.findByUsername(key))
                    .orElseThrow(() -> new AccessDeniedException("User not found for principal: " + key));
        }
        String name = auth.getName();
        if (name != null && !"anonymousUser".equalsIgnoreCase(name)) {
            return userRepository.findByEmail(name)
                    .or(() -> userRepository.findByUsername(name))
                    .orElseThrow(() -> new AccessDeniedException("User not found for name: " + name));
        }
        throw new AccessDeniedException("Unauthenticated");
    }

    @PostMapping
    public ResponseEntity<WorkplaceDetailResponse> create(@RequestBody @Valid WorkplaceCreateRequest req) {
        var res = workplaceService.create(req, currentUser());
        return ResponseEntity.ok(res);
    }

    @PostMapping(path = "/{id}/image", consumes = {"multipart/form-data"})
    public ResponseEntity<WorkplaceImageResponseDto> uploadImage(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file
    ) {
        Long userId = currentUser().getId();
        var res = workplaceService.uploadImage(id, file, userId);
        return ResponseEntity.ok(res);
    }


    @DeleteMapping(path = "/{id}/image")
    public ResponseEntity<ApiMessage> deleteImage(@PathVariable Long id) {
        Long userId = currentUser().getId();
        workplaceService.deleteImage(id, userId);
        return ResponseEntity.ok(ApiMessage.builder()
                .message("Workplace image deleted")
                .code("WORKPLACE_IMAGE_DELETED")
                .build());
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<WorkplaceBriefResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String sector,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String ethicalTag,
            @RequestParam(required = false) Double minRating,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String search
    ) {
        var res = workplaceService.listBrief(page, size, sector, location, ethicalTag, minRating, sortBy, search);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkplaceDetailResponse> detail(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean includeReviews,
            @RequestParam(defaultValue = "3") int reviewsLimit
    ) {
        var res = workplaceService.getDetail(id, includeReviews, reviewsLimit);
        return ResponseEntity.ok(res);
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkplaceDetailResponse> update(
            @PathVariable Long id,
            @RequestBody @Valid WorkplaceUpdateRequest req
    ) {
        var res = workplaceService.update(id, req, currentUser());
        return ResponseEntity.ok(res);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiMessage> delete(@PathVariable Long id) {
        workplaceService.softDelete(id, currentUser());
        return ResponseEntity.ok(ApiMessage.builder()
                .message("Workplace deleted")
                .code("WORKPLACE_DELETED")
                .build());
    }

    @GetMapping("/{id}/rating")
    public ResponseEntity<WorkplaceRatingResponse> getRating(@PathVariable Long id) {
        var res = workplaceService.getRating(id);
        return ResponseEntity.ok(res);
    }
}