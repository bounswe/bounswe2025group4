package org.bounswe.jobboardbackend.jobapplication.controller;

import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.jobapplication.dto.CreateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.dto.JobApplicationResponse;
import org.bounswe.jobboardbackend.jobapplication.dto.UpdateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.service.JobApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationResponse>> getFiltered(
            @RequestParam(required = false) Long jobSeekerId,
            @RequestParam(required = false) Long jobPostId
    ) {
        if (jobSeekerId != null) {
            return ResponseEntity.ok(service.getByJobSeekerId(jobSeekerId));
        } else if (jobPostId != null) {
            return ResponseEntity.ok(service.getByJobPostId(jobPostId));
        } else {
            // If no filter provided, return empty list or throw error
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(@RequestBody @Valid CreateJobApplicationRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<JobApplicationResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid UpdateJobApplicationRequest dto) {
        String feedback = (dto != null) ? dto.getFeedback() : null;
        return ResponseEntity.ok(service.approve(id, feedback));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<JobApplicationResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid UpdateJobApplicationRequest dto) {
        String feedback = (dto != null) ? dto.getFeedback() : null;
        return ResponseEntity.ok(service.reject(id, feedback));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
