package org.bounswe.jobboardbackend.activity.controller;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.activity.model.Activity;
import org.bounswe.jobboardbackend.activity.service.ActivityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<Activity>> getUserActivities(@PathVariable Long userId, Pageable pageable) {
        return ResponseEntity.ok(activityService.getActivitiesByActor(userId, pageable));
    }
}
