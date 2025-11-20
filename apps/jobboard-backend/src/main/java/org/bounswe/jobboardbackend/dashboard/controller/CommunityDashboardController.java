package org.bounswe.jobboardbackend.dashboard.controller;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.dashboard.dto.DashboardStatsResponse;
import org.bounswe.jobboardbackend.dashboard.service.CommunityDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/dashboard")
@RequiredArgsConstructor
public class CommunityDashboardController {

    private final CommunityDashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}