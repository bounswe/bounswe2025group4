package org.bounswe.jobboardbackend.jobapplication.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.bounswe.jobboardbackend.exception.ApiError;
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
@Tag(name = "Job Applications", description = "Job Application Management API")
public class JobApplicationController {

    private final JobApplicationService service;

    public JobApplicationController(JobApplicationService service) {
        this.service = service;
    }

    @Operation(summary = "List Applications (Filtered)", description = "Retrieves a filtered list of job applications based on query parameters.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Applications retrieved successfully"),
            @ApiResponse(responseCode = "400", description = "Missing filter parameters", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"MISSING_FILTER_PARAMETER\", \"message\": \"Missing filter parameter, at least one of jobSeekerId or jobPostId must be provided\", \"path\": \"/api/applications\" }"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<List<JobApplicationResponse>> getFiltered(
            @Parameter(description = "Filter by Job Seeker ID") @RequestParam(required = false) Long jobSeekerId,
            @Parameter(description = "Filter by Job Post ID") @RequestParam(required = false) Long jobPostId) {
        if (jobSeekerId != null) {
            return ResponseEntity.ok(service.getByJobSeekerId(jobSeekerId));
        } else if (jobPostId != null) {
            return ResponseEntity.ok(service.getByJobPostId(jobPostId));
        } else {
            throw new HandleException(ErrorCode.MISSING_FILTER_PARAMETER,
                    "Missing filter parameter, at least one of jobSeekerId or jobPostId must be provided");
        }
    }

    @Operation(summary = "List Applications by Job Seeker", description = "Retrieves all applications submitted by a specific job seeker.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Applications retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/job-seeker/1\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/applications/job-seeker/1\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/job-seeker/{jobSeekerId}")
    public ResponseEntity<List<JobApplicationResponse>> getByJobSeeker(
            @Parameter(description = "ID of the job seeker") @PathVariable Long jobSeekerId) {
        return ResponseEntity.ok(service.getByJobSeekerId(jobSeekerId));
    }

    @Operation(summary = "List Applications by Job Post", description = "Retrieves all applications for a specific job post.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Applications retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/job-post/1\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/applications/job-post/1\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/job-post/{jobPostId}")
    public ResponseEntity<List<JobApplicationResponse>> getByJobPost(
            @Parameter(description = "ID of the job post") @PathVariable Long jobPostId) {
        return ResponseEntity.ok(service.getByJobPostId(jobPostId));
    }

    @Operation(summary = "List Applications by Workplace", description = "Retrieves all applications for a specific workplace.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Applications retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/workplace/1\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/applications/workplace/1\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/workplace/{workplaceId}")
    public ResponseEntity<List<JobApplicationResponse>> getByWorkplace(
            @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId) {
        return ResponseEntity.ok(service.getByWorkplaceId(workplaceId));
    }

    @Operation(summary = "Get Application by ID", description = "Retrieves a specific job application by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Application retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/applications/1\" }"))),
            @ApiResponse(responseCode = "404", description = "Application not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Job application not found\", \"path\": \"/api/applications/1\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getById(
            @Parameter(description = "ID of the application") @PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @Operation(summary = "Create Application", description = "Creates a new job application.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Application created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"You have already applied to this job\", \"path\": \"/api/applications\" }"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<JobApplicationResponse> create(@RequestBody @Valid CreateJobApplicationRequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @Operation(summary = "Approve Application", description = "Approves a job application. Optionally provides feedback.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Application approved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1/approve\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not the employer)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not authorized to approve this application\", \"path\": \"/api/applications/1/approve\" }"))),
            @ApiResponse(responseCode = "404", description = "Application not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Job application not found\", \"path\": \"/api/applications/1/approve\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/approve")
    public ResponseEntity<JobApplicationResponse> approve(
            @Parameter(description = "ID of the application") @PathVariable Long id,
            @RequestBody(required = false) @Valid UpdateJobApplicationRequest dto) {
        String feedback = (dto != null) ? dto.getFeedback() : null;
        return ResponseEntity.ok(service.approve(id, feedback));
    }

    @Operation(summary = "Reject Application", description = "Rejects a job application. Optionally provides feedback.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Application rejected successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1/reject\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not the employer)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not authorized to reject this application\", \"path\": \"/api/applications/1/reject\" }"))),
            @ApiResponse(responseCode = "404", description = "Application not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Job application not found\", \"path\": \"/api/applications/1/reject\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/{id}/reject")
    public ResponseEntity<JobApplicationResponse> reject(
            @Parameter(description = "ID of the application") @PathVariable Long id,
            @RequestBody(required = false) @Valid UpdateJobApplicationRequest dto) {
        String feedback = (dto != null) ? dto.getFeedback() : null;
        return ResponseEntity.ok(service.reject(id, feedback));
    }

    @Operation(summary = "Delete Application", description = "Deletes a job application.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Application deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1\" }"))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not authorized to delete this application\", \"path\": \"/api/applications/1\" }"))),
            @ApiResponse(responseCode = "404", description = "Application not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Job application not found\", \"path\": \"/api/applications/1\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "ID of the application") @PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --------------------------------
    // CV / Resume endpoints
    // --------------------------------

    @Operation(summary = "Upload CV", description = "Uploads a CV (Resume) file for an application. File format usually PDF.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "CV uploaded successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid file or request", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid file format\", \"path\": \"/api/applications/1/cv\" }"))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1/cv\" }"))),
            @ApiResponse(responseCode = "404", description = "Application not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Job application not found\", \"path\": \"/api/applications/1/cv\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @PostMapping(path = "/{id}/cv", consumes = { "multipart/form-data" })
    public ResponseEntity<CvUploadResponse> uploadCv(
            @Parameter(description = "ID of the application") @PathVariable Long id,
            @Parameter(description = "CV File (PDF)") @RequestPart("file") MultipartFile file) {
        return ResponseEntity.ok(service.uploadCv(id, file));
    }

    @Operation(summary = "Get CV URL", description = "Retrieves the public URL of the uploaded CV.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "CV URL retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1/cv\" }"))),
            @ApiResponse(responseCode = "404", description = "Application or CV not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"CV not found\", \"path\": \"/api/applications/1/cv\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/cv")
    public ResponseEntity<String> getCvUrl(@Parameter(description = "ID of the application") @PathVariable Long id) {
        return ResponseEntity.ok(service.getCvUrl(id));
    }

    @Operation(summary = "Delete CV", description = "Deletes the uploaded CV for an application.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "CV deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/applications/1/cv\" }"))),
            @ApiResponse(responseCode = "404", description = "Application not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Job application not found\", \"path\": \"/api/applications/1/cv\" }")))
    })
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}/cv")
    public ResponseEntity<Void> deleteCv(@Parameter(description = "ID of the application") @PathVariable Long id) {
        service.deleteCv(id);
        return ResponseEntity.noContent().build();
    }
}
