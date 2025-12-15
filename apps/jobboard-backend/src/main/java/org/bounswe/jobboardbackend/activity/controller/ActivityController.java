package org.bounswe.jobboardbackend.activity.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.activity.model.Activity;
import org.bounswe.jobboardbackend.activity.service.ActivityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Activity", description = "Activity Logging and Retrieval API")
public class ActivityController {

    private final ActivityService activityService;

    @Operation(summary = "Get User Activities", description = "Retrieves a paginated list of activities for a specific user. This endpoint is currently public.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Activities retrieved successfully")
    })
    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Activity>> getUserActivities(
            @Parameter(description = "ID of the user") @PathVariable Long userId,
            @Parameter(description = "Pagination information") Pageable pageable) {
        return ResponseEntity.ok(activityService.getActivitiesByActor(userId, pageable));
    }
}
