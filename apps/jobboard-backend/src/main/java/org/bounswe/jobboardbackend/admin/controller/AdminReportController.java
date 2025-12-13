package org.bounswe.jobboardbackend.admin.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminReportController {

    private final ReportService reportService;
    private final AdminReportService adminReportService;

    @GetMapping
    public ResponseEntity<Page<ReportResponse>> listReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) ReportableEntityType entityType,
            @PageableDefault(size = 20) Pageable pageable) {

        Page<ReportResponse> reports = reportService.listReports(status, entityType, pageable);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReport(@PathVariable Long id) {
        ReportResponse report = reportService.getReport(id);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/{id}/resolve")
    public ResponseEntity<AdminActionResponse> resolveReport(
            @PathVariable Long id,
            @Valid @RequestBody ResolveReportRequest request) {

        adminReportService.resolveReport(id, request);
        return ResponseEntity.ok(new AdminActionResponse("Report resolved successfully"));
    }
}
