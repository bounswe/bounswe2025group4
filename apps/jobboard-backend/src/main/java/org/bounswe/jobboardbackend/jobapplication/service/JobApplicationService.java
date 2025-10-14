package org.bounswe.jobboardbackend.jobapplication.service;

import org.bounswe.jobboardbackend.auth.model.Role;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.jobapplication.dto.CreateJobApplicationRequest;
import org.bounswe.jobboardbackend.jobapplication.dto.JobApplicationResponse;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus;
import org.bounswe.jobboardbackend.jobapplication.repository.JobApplicationRepository;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;

    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 UserRepository userRepository,
                                 JobPostRepository jobPostRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobPostRepository = jobPostRepository;
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getByJobSeekerId(Long jobSeekerId) {
        return applicationRepository.findByJobSeekerId(jobSeekerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobApplicationResponse> getByJobPostId(Long jobPostId) {
        return applicationRepository.findByJobPostId(jobPostId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobApplicationResponse getById(Long id) {
        return applicationRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));
    }

    @Transactional
    public JobApplicationResponse create(CreateJobApplicationRequest dto) {
        User jobSeeker = getCurrentUser();

        // Check if user has JOBSEEKER role
        if (jobSeeker.getRole() != Role.ROLE_JOBSEEKER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only users with JOBSEEKER role can apply for jobs");
        }

        // Get job post
        JobPost jobPost = jobPostRepository.findById(dto.getJobPostId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job post with ID " + dto.getJobPostId() + " not found"));

        // Create application
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPost(jobPost)
                .status(JobApplicationStatus.PENDING)
                .specialNeeds(dto.getSpecialNeeds())
                .appliedDate(LocalDateTime.now())
                .build();

        return toResponseDto(applicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse approve(Long id, String feedback) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the employer who posted the job can approve
        User employer = getCurrentUser();

        if (!application.getJobPost().getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the employer who posted the job can approve applications");
        }

        // Update status
        application.setStatus(JobApplicationStatus.APPROVED);
        if (feedback != null && !feedback.isEmpty()) {
            application.setFeedback(feedback);
        }

        return toResponseDto(applicationRepository.save(application));
    }

    @Transactional
    public JobApplicationResponse reject(Long id, String feedback) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the employer who posted the job can reject
        User employer = getCurrentUser();

        if (!application.getJobPost().getEmployer().getId().equals(employer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the employer who posted the job can reject applications");
        }

        // Update status
        application.setStatus(JobApplicationStatus.REJECTED);
        if (feedback != null && !feedback.isEmpty()) {
            application.setFeedback(feedback);
        }

        return toResponseDto(applicationRepository.save(application));
    }

    @Transactional
    public void delete(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the applicant can delete their own application
        User user = getCurrentUser();

        if (!application.getJobSeeker().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the applicant can delete their own application");
        }

        applicationRepository.delete(application);
    }

    private JobApplicationResponse toResponseDto(JobApplication application) {
        JobPost jobPost = application.getJobPost();
        User jobSeeker = application.getJobSeeker();

        return JobApplicationResponse.builder()
                .id(application.getId())
                .jobSeekerId(jobSeeker.getId())
                .applicantName(jobSeeker.getUsername())
                .jobPostId(jobPost.getId())
                .title(jobPost.getTitle())
                .company(jobPost.getCompany())
                .status(application.getStatus())
                .specialNeeds(application.getSpecialNeeds())
                .feedback(application.getFeedback())
                .appliedDate(application.getAppliedDate())
                .build();
    }

    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found in the system"));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No authentication context found");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid authentication context");
    }
}
