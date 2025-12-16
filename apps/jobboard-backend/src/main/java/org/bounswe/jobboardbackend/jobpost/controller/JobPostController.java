package org.bounswe.jobboardbackend.jobpost.controller;

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
import org.bounswe.jobboardbackend.jobpost.dto.CreateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.UpdateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.JobPostResponse;
import org.bounswe.jobboardbackend.jobpost.service.JobPostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@Tag(name = "Job Posts", description = "Job Post Management API")
public class JobPostController {

        private final JobPostService service;

        public JobPostController(JobPostService service) {
                this.service = service;
        }

        @Operation(summary = "Search Job Posts", description = "Retrieves a list of job posts filtered by various criteria.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Job posts retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/jobs\" }")))
        })
        @PreAuthorize("isAuthenticated()")
        @GetMapping
        public ResponseEntity<List<JobPostResponse>> getFiltered(
                        @Parameter(description = "Filter by job title (contains)") @RequestParam(required = false) String title,
                        @Parameter(description = "Filter by company name (contains)") @RequestParam(required = false) String companyName,
                        @Parameter(description = "Filter by location") @RequestParam(required = false) String location,
                        @Parameter(description = "Filter by sector") @RequestParam(required = false) String sector,
                        @Parameter(description = "Filter by ethical tags") @RequestParam(required = false) List<String> ethicalTags,
                        @Parameter(description = "Minimum salary") @RequestParam(required = false) Integer minSalary,
                        @Parameter(description = "Maximum salary") @RequestParam(required = false) Integer maxSalary,
                        @Parameter(description = "Filter by remote availability") @RequestParam(required = false) Boolean isRemote,
                        @Parameter(description = "Filter by inclusive opportunity") @RequestParam(required = false) Boolean inclusiveOpportunity,
                        @Parameter(description = "Filter by non-profit status") @RequestParam(required = false) Boolean nonProfit) {
                return ResponseEntity
                                .ok(service.getFiltered(title, companyName, location, sector, ethicalTags, minSalary,
                                                maxSalary, isRemote, inclusiveOpportunity, nonProfit));
        }

        @Operation(summary = "List Job Posts by Employer", description = "Retrieves all job posts created by a specific employer.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Job posts retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/jobs/employer/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/jobs/employer/1\" }")))
        })
        @PreAuthorize("isAuthenticated()")
        @GetMapping("/employer/{employerId}")
        public ResponseEntity<List<JobPostResponse>> getByEmployerId(
                        @Parameter(description = "ID of the employer") @PathVariable Long employerId) {
                return ResponseEntity.ok(service.getByEmployerId(employerId));
        }

        @Operation(summary = "List Job Posts by Workplace", description = "Retrieves all job posts associated with a specific workplace.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Job posts retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/jobs/workplace/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"Access denied\", \"path\": \"/api/jobs/workplace/1\" }")))
        })
        @PreAuthorize("isAuthenticated()")
        @GetMapping("/workplace/{workplaceId}")
        public ResponseEntity<List<JobPostResponse>> getByWorkplaceId(
                        @Parameter(description = "ID of the workplace") @PathVariable Long workplaceId) {
                return ResponseEntity.ok(service.getByWorkplaceId(workplaceId));
        }

        @Operation(summary = "Get Job Post by ID", description = "Retrieves a specific job post by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Job post retrieved successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"Access denied\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Job post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Job post not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PreAuthorize("isAuthenticated()")
        @GetMapping("/{id}")
        public ResponseEntity<JobPostResponse> getById(
                        @Parameter(description = "ID of the job post") @PathVariable Long id) {
                return ResponseEntity.ok(service.getById(id));
        }

        @Operation(summary = "Create Job Post", description = "Creates a new job post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Job post created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid job post data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"Access denied\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PreAuthorize("isAuthenticated()")
        @PostMapping
        public ResponseEntity<JobPostResponse> create(@RequestBody @Valid CreateJobPostRequest dto) {
                return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
        }

        @Operation(summary = "Delete Job Post", description = "Deletes a job post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Job post deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the owner/admin)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to delete this job post\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Job post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Job post not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PreAuthorize("isAuthenticated()")
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(@Parameter(description = "ID of the job post") @PathVariable Long id) {
                service.delete(id);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Update Job Post", description = "Updates an existing job post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Job post updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 400, \"error\": \"Bad Request\", \"message\": \"Invalid job post data\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the owner)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not authorized to update this job post\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
                        @ApiResponse(responseCode = "404", description = "Job post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Job post not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
        })
        @PreAuthorize("isAuthenticated()")
        @PutMapping("/{id}")
        public ResponseEntity<JobPostResponse> update(
                        @Parameter(description = "ID of the job post") @PathVariable Long id,
                        @RequestBody @Valid UpdateJobPostRequest dto) {
                return ResponseEntity.ok(service.update(id, dto));
        }
}
