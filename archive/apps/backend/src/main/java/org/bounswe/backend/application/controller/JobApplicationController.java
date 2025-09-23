package org.bounswe.backend.application.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.bounswe.backend.application.dto.JobApplicationCreateDto;
import org.bounswe.backend.application.dto.JobApplicationDto;
import org.bounswe.backend.application.dto.JobApplicationUpdateDto;
import org.bounswe.backend.application.service.JobApplicationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@Tag(name = "Applications", description = "Applications endpoints")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<JobApplicationDto>> getApplicationsByUser(@RequestParam Long userId) {
        return ResponseEntity.ok(service.getApplicationsByUserId(userId));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<List<JobApplicationDto>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(service.getApplicationsByJobId(jobId));
    }

    @PostMapping
    public ResponseEntity<JobApplicationDto> applyForJob(@RequestBody @Valid JobApplicationCreateDto createDto) {
        return ResponseEntity.ok(service.applyForJob(createDto));
    }

    @PutMapping("/{applicationId}")
    public ResponseEntity<JobApplicationDto> updateStatus(
            @PathVariable Long applicationId, 
            @RequestBody @Valid JobApplicationUpdateDto updateDto) {
        return ResponseEntity.ok(service.updateApplicationStatus(applicationId, updateDto));
    }

    @DeleteMapping("/{applicationId}")
    public ResponseEntity<Void> delete(@PathVariable Long applicationId) {
        service.delete(applicationId);
        return ResponseEntity.noContent().build();
    }
}
