package org.bounswe.jobboardbackend.workplace.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.workplace.dto.*;
import org.bounswe.jobboardbackend.workplace.service.EmployerService;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ApiError;
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
@Tag(name = "Workplace Employer", description = "Workplace Employer Management API")
public class WorkplaceEmployerController {

    private final EmployerService employerService;
    private final UserRepository userRepository;

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            throw new AccessDeniedException("Unauthenticated");
        Object principal = auth.getPrincipal();
        if (principal instanceof User u)
            return u;
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
        if (auth == null)
            return false;
        for (GrantedAuthority ga : auth.getAuthorities()) {
            if ("ROLE_ADMIN".equals(ga.getAuthority()))
                return true;
        }
        return false;
    }

    // === LIST EMPLOYERS ===
    @Operation(summary = "List Employers", description = "Lists all employers for a specific workplace.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employers retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/{workplaceId}/employers")
    public ResponseEntity<List<EmployerListItem>> listEmployers(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId) {
        return ResponseEntity.ok(employerService.listEmployers(workplaceId));
    }

    // === LIST WORKPLACES OF EMPLOYER ===
    @Operation(summary = "List My Workplaces", description = "Lists all workplaces where the current user is an employer.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Workplaces retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/employers/me")
    public ResponseEntity<List<EmployerWorkplaceBrief>> myWorkplaces() {
        var user = currentUser();
        return ResponseEntity.ok(employerService.listWorkplacesOfEmployer(user.getId()));
    }

    // === REQUESTS ===
    @Operation(summary = "List Employer Requests", description = "Lists pending employer requests for a workplace.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Requests retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not an admin or manager/owner of the workplace)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to view requests for this workplace\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/{workplaceId}/employers/request")
    public ResponseEntity<PaginatedResponse<EmployerRequestResponse>> listRequests(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        var user = currentUser();
        var res = employerService.listRequests(workplaceId, page, size, user.getId(), isAdmin());
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Create Employer Request", description = "Creates a request to become an employer at a workplace.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input or request already exists", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Employer request already exists\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Workplace not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PostMapping("/{workplaceId}/employers/request")
    public ResponseEntity<ApiMessage> createRequest(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @RequestBody @Valid EmployerRequestCreate req) {
        var user = currentUser(); // başvuru yapan
        employerService.createRequest(workplaceId, req, user.getId());
        return ResponseEntity.ok(
                ApiMessage.builder()
                        .message("Employer request created")
                        .code("EMPLOYER_REQUEST_CREATED")
                        .build());
    }

    @Operation(summary = "Get Employer Request", description = "Retrieves details of a specific employer request.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not authorized to view this request)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to view this request\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Request not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Employer request not found with id: 1\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/{workplaceId}/employers/request/{requestId}")
    public ResponseEntity<EmployerRequestResponse> getRequest(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the request") @PathVariable Long requestId) {
        var user = currentUser();
        var res = employerService.getRequest(workplaceId, requestId, user.getId(), isAdmin());
        return ResponseEntity.ok(res);
    }

    @Operation(summary = "Resolve Employer Request", description = "Approves or rejects an employer request.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Request resolved successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid action or request state", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid action: Request is already resolved\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not authorized to resolve requests for this workplace)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to resolve employer requests\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Request not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Employer request not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @PostMapping("/{workplaceId}/employers/request/{requestId}")
    public ResponseEntity<ApiMessage> resolve(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the request") @PathVariable Long requestId,
            @RequestBody @Valid EmployerRequestResolve req) {
        var user = currentUser();
        employerService.resolveRequest(workplaceId, requestId, req, user.getId(), isAdmin());
        return ResponseEntity.ok(
                ApiMessage.builder().message("Employer request resolved").code("EMPLOYER_REQUEST_RESOLVED").build());
    }

    @Operation(summary = "Remove Employer", description = "Removes an employer from a workplace.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Employer removed successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not authorized to remove employers)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to remove employers\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Employer or workplace not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Employer user not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @DeleteMapping("/{workplaceId}/employers/{employerId}")
    public ResponseEntity<ApiMessage> removeEmployer(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId,
            @Parameter(description = "ID of the employer (user ID)") @PathVariable Long employerId) {
        var user = currentUser();
        employerService.removeEmployer(workplaceId, employerId, user.getId(), isAdmin());
        return ResponseEntity.ok(ApiMessage.builder().message("Employer removed").code("EMPLOYER_REMOVED").build());
    }

    // === LIST MY EMPLOYER REQUESTS ===
    @Operation(summary = "List My Employer Requests", description = "Lists employer requests made by the current user.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Requests retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/employers/requests/me")
    public ResponseEntity<PaginatedResponse<EmployerRequestResponse>> myRequests(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        var user = currentUser();
        var res = employerService.listMyRequests(user.getId(), page, size);
        return ResponseEntity.ok(res);
    }
}
