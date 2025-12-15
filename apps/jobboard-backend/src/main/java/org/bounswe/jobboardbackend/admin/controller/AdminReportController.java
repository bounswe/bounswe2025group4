package org.bounswe.jobboardbackend.admin.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import org.bounswe.jobboardbackend.exception.ApiError;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.admin.dto.AdminActionResponse;
import org.bounswe.jobboardbackend.report.dto.ReportResponse;
import org.bounswe.jobboardbackend.report.dto.ResolveReportRequest;
import org.bounswe.jobboardbackend.report.model.enums.ReportableEntityType;
import org.bounswe.jobboardbackend.report.model.enums.ReportStatus;
import org.bounswe.jobboardbackend.admin.service.AdminReportService;
import org.bounswe.jobboardbackend.report.service.ReportService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/report")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN') and isAuthenticated()")
@Tag(name = "Admin Report", description = "Admin Report Management API")
public class AdminReportController {

        private final ReportService reportService;
        private final AdminReportService adminReportService;

        @Operation(summary = "List reports", description = "Retrieve a paginated list of reports with optional filtering by status and entity type.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "List of reports retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/admin/report\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Admin only)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/admin/report\" }")))
        })
        @GetMapping
        public ResponseEntity<Page<ReportResponse>> listReports(
                        @Parameter(description = "Filter by report status") @RequestParam(required = false) ReportStatus status,
                        @Parameter(description = "Filter by entity type") @RequestParam(required = false) ReportableEntityType entityType,
                        @Parameter(description = "Pagination information") @PageableDefault(size = 20) Pageable pageable) {

                Page<ReportResponse> reports = reportService.listReports(status, entityType, pageable);
                return ResponseEntity.ok(reports);
        }

        @Operation(summary = "Get report details", description = "Retrieve detailed information about a specific report.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Report retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "Report not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Report not found\", \"path\": \"/api/admin/report/1\" }")))
        })
        @GetMapping("/{id}")
        public ResponseEntity<ReportResponse> getReport(
                        @Parameter(description = "ID of the report to retrieve") @PathVariable Long id) {
                ReportResponse report = reportService.getReport(id);
                return ResponseEntity.ok(report);
        }

        @Operation(summary = "Resolve a report", description = "Take action on a report (resolve, reject) and optionally delete content or ban user.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Report resolved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request or action", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid resolution status\", \"path\": \"/api/admin/report/1/resolve\" }"))),
                        @ApiResponse(responseCode = "404", description = "Report not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{ \"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Report not found\", \"path\": \"/api/admin/report/1/resolve\" }")))
        })
        @PostMapping("/{id}/resolve")
        public ResponseEntity<AdminActionResponse> resolveReport(
                        @Parameter(description = "ID of the report to resolve") @PathVariable Long id,
                        @Valid @RequestBody ResolveReportRequest request,
                        Authentication auth) {

                UserDetailsImpl userDetails = (UserDetailsImpl) auth
                                .getPrincipal();
                adminReportService.resolveReport(id, request, userDetails.getId());
                return ResponseEntity.ok(new AdminActionResponse("Report resolved successfully"));
        }
}
