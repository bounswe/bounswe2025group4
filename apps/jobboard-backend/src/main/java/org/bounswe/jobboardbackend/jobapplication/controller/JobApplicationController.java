package org.bounswe.jobboardbackend.jobapplication.controller;

import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobapplication.dto.CreateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.dto.CvUploadResponse;
import org.bounswe.jobboardbackend.jobapplication.dto.JobApplicationResponse;
import org.bounswe.jobboardbackend.jobapplication.dto.UpdateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.service.JobApplicationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<JobApplicationResponse>> getByJobSeeker(@PathVariable Long jobSeekerId) {
        return ResponseEntity.ok(service.getByJobSeekerId(jobSeekerId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/job-post/{jobPostId}")
    public ResponseEntity<List<JobApplicationResponse>> getByJobPost(@PathVariable Long jobPostId) {
        return ResponseEntity.ok(service.getByJobPostId(jobPostId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/workplace/{workplaceId}")
    public ResponseEntity<List<JobApplicationResponse>> getByWorkplace(@PathVariable Long workplaceId) {
        return ResponseEntity.ok(service.getByWorkplaceId(workplaceId));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(@RequestBody @Valid CreateJobApplicationRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/approve")
    public ResponseEntity<JobApplicationResponse> approve(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid UpdateJobApplicationRequest dto) {
        String feedback = (dto != null) ? dto.getFeedback() : null;
        return ResponseEntity.ok(service.approve(id, feedback));
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/reject")
    public ResponseEntity<JobApplicationResponse> reject(
            @PathVariable Long id,
            @RequestBody(required = false) @Valid UpdateJobApplicationRequest dto) {
        String feedback = (dto != null) ? dto.getFeedback() : null;
        return ResponseEntity.ok(service.reject(id, feedback));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --------------------------------
    // CV / Resume endpoints
    // --------------------------------

    /**
     * POST /api/applications/{id}/cv
     * Upload CV for an application (multipart/form-data)
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping(path = "/{id}/cv", consumes = {"multipart/form-data"})
    public ResponseEntity<CvUploadResponse> uploadCv(
            @PathVariable Long id,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadCv(id, file));
    }

    /**
     * GET /api/applications/{id}/cv
     * Get CV URL for an application
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/cv")
    public ResponseEntity<String> getCvUrl(@PathVariable Long id) {
        return ResponseEntity.ok(service.getCvUrl(id));
    }

    /**
     * DELETE /api/applications/{id}/cv
     * Delete CV for an application
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}/cv")
    public ResponseEntity<Void> deleteCv(@PathVariable Long id) {
        service.deleteCv(id);
        return ResponseEntity.noContent().build();
    }
}
