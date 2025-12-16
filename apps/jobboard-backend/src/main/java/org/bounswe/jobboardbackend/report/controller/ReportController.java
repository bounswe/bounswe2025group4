package org.bounswe.jobboardbackend.report.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.bounswe.jobboardbackend.exception.ApiError;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.report.dto.CreateReportRequest;
import org.bounswe.jobboardbackend.report.dto.ReportResponse;
import org.bounswe.jobboardbackend.report.service.ReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
@Tag(name = "Report", description = "Report Management API")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    @Operation(summary = "Create a new report", description = "Allows an authenticated user to report a workplace, review, or forum content.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Report created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request body", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"You have already reported this content\", \"path\": \"/api/report\" }"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/report\" }"))),
            @ApiResponse(responseCode = "404", description = "User or Entity not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"User not found\", \"path\": \"/api/report\" }")))
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ReportResponse> createReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication auth) {

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "User not found"));

        ReportResponse response = reportService.createReport(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
