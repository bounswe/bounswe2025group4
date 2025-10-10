package org.bounswe.jobboardbackend.jobpost.controller;

import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.jobpost.dto.JobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.JobPostResponse;
import org.bounswe.jobboardbackend.jobpost.service.JobPostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
public class JobPostController {

    private final JobPostService service;

    public JobPostController(JobPostService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<JobPostResponse>> getFiltered(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) List<String> ethicalTags,
            @RequestParam(required = false) Integer minSalary,
            @RequestParam(required = false) Integer maxSalary,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(required = false) Boolean isInclusiveOpportunity
    ) {
        return ResponseEntity.ok(service.getFiltered(title, companyName, ethicalTags, minSalary, maxSalary, isRemote, isInclusiveOpportunity));
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobPostResponse>> getByEmployerId(@PathVariable Long employerId) {
        return ResponseEntity.ok(service.getByEmployerId(employerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<JobPostResponse> create(@RequestBody @Valid JobPostRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPostResponse> update(@PathVariable Long id, @RequestBody @Valid JobPostRequest dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

}
