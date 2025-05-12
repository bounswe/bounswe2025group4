package org.bounswe.backend.job.controller;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import org.bounswe.backend.job.dto.JobPostDto;
import org.bounswe.backend.job.service.JobPostService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Jobs", description = "Job board endpoints")
public class JobPostController {

    private final JobPostService service;

    public JobPostController(JobPostService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<JobPostDto>> getAll(
            @Parameter(name = "title", description = "Job title prefix", in = ParameterIn.QUERY)
            @RequestParam(required = false) String title,

            @Parameter(name = "companyName", description = "Company name prefix", in = ParameterIn.QUERY)
            @RequestParam(required = false) String companyName,

            @Parameter(name = "ethicalTags", description = "List of ethical policy tags", in = ParameterIn.QUERY)
            @RequestParam(required = false) List<String> ethicalTags,

            @Parameter(name = "minSalary", description = "Minimum salary", in = ParameterIn.QUERY)
            @RequestParam(required = false) Integer minSalary,

            @Parameter(name = "maxSalary", description = "Maximum salary", in = ParameterIn.QUERY)
            @RequestParam(required = false) Integer maxSalary,

            @Parameter(name = "isRemote", description = "Whether the job is remote", in = ParameterIn.QUERY)
            @RequestParam(required = false) Boolean isRemote
    ) {
        return ResponseEntity.ok(service.getFiltered(title, companyName, ethicalTags, minSalary, maxSalary, isRemote));
    }

    @GetMapping("/employer/{employerId}")
    public ResponseEntity<List<JobPostDto>> getByEmployerId(@PathVariable Long employerId) {
        return ResponseEntity.ok(service.getByEmployerId(employerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobPostDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<JobPostDto> create(@RequestBody JobPostDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobPostDto> update(@PathVariable Long id, @RequestBody @Valid JobPostDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

}
