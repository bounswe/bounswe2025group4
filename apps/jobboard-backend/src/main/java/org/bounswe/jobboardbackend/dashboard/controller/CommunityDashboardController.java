package org.bounswe.jobboardbackend.dashboard.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.dashboard.dto.DashboardStatsResponse;
import org.bounswe.jobboardbackend.dashboard.service.CommunityDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/dashboard")
@RequiredArgsConstructor
@Tag(name = "Community Dashboard", description = "Public API for community statistics")
public class CommunityDashboardController {

    private final CommunityDashboardService dashboardService;

    @Operation(summary = "Get Dashboard Statistics", description = "Retrieves public statistics about the community, including users, jobs, applications, and mentorships.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Statistics retrieved successfully")
    })
    @GetMapping
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}