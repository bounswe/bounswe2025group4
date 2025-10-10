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
import org.springframework.stereotype.Service;
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

    public List<JobApplicationResponse> getByJobSeekerId(Long jobSeekerId) {
        return applicationRepository.findByJobSeekerId(jobSeekerId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public List<JobApplicationResponse> getByJobPostId(Long jobPostId) {
        return applicationRepository.findByJobPostId(jobPostId).stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    public JobApplicationResponse getById(Long id) {
        return applicationRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));
    }

    public JobApplicationResponse create(CreateJobApplicationRequest dto) {
        // Get authenticated user (jobseeker)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User jobSeeker = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));

        // Check if user has EMPLOYEE role
        if (!jobSeeker.getRoles().contains(Role.ROLE_JOBSEEKER)) {
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

    public JobApplicationResponse approve(Long id, String feedback) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the employer who posted the job can approve
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));

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

    public JobApplicationResponse reject(Long id, String feedback) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the employer who posted the job can reject
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));

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

    public void delete(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application with ID " + id + " not found"));

        // Check authorization: only the applicant can delete their own application
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Authenticated user not found"));

        if (!application.getJobSeeker().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the applicant can delete their own application");
        }

        applicationRepository.deleteById(id);
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
}
