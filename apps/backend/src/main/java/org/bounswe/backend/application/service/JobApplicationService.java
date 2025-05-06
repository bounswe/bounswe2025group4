package org.bounswe.backend.application.service;


import org.bounswe.backend.application.repository.JobApplicationRepository;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;


import org.bounswe.backend.application.dto.JobApplicationDto;
import org.bounswe.backend.application.entity.JobApplication;
import org.bounswe.backend.common.enums.JobApplicationStatus;

import org.bounswe.backend.job.entity.JobPost;
import org.bounswe.backend.job.repository.JobPostRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Date;

@Service
public class JobApplicationService {

    private final JobApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostRepository jobPostRepository;

    @Autowired
    public JobApplicationService(JobApplicationRepository applicationRepository,
                                 UserRepository userRepository,
                                 JobPostRepository jobPostRepository) {
        this.applicationRepository = applicationRepository;
        this.userRepository = userRepository;
        this.jobPostRepository = jobPostRepository;
    }

    public List<JobApplicationDto> getAll() {
        return applicationRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public JobApplicationDto getById(Long id) {
        return applicationRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Application not found"));
    }

    public List<JobApplicationDto> getApplicationsByUserId(Long userId) {
        return applicationRepository.findByJobSeekerId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<JobApplicationDto> getApplicationsByJobId(Long jobId) {
        return applicationRepository.findByJobPostingId(jobId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public JobApplicationDto applyForJob(JobApplicationDto dto) {
        User jobSeeker = userRepository.findById(dto.getJobSeekerId())
                .orElseThrow(() -> new RuntimeException("Job seeker not found"));
        
        JobPost jobPost = jobPostRepository.findById(dto.getJobPostingId())
                .orElseThrow(() -> new RuntimeException("Job posting not found"));
        
        JobApplication application = JobApplication.builder()
                .jobSeeker(jobSeeker)
                .jobPosting(jobPost)
                .status(JobApplicationStatus.PENDING)
                .submissionDate(new Date())
                .build();
        
        return toDto(applicationRepository.save(application));
    }

    public JobApplicationDto updateApplicationStatus(Long applicationId, JobApplicationDto dto) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        
        application.updateStatus(dto.getStatus());
        
        if (dto.getFeedback() != null && !dto.getFeedback().isEmpty()) {
            application.addFeedback(dto.getFeedback());
        }
        
        return toDto(applicationRepository.save(application));
    }

    public void delete(Long id) {
        applicationRepository.deleteById(id);
    }

    private JobApplicationDto toDto(JobApplication application) {
        return JobApplicationDto.builder()
                .id(application.getId())
                .jobSeekerId(application.getJobSeeker().getId())
                .jobPostingId(application.getJobPosting().getId())
                .status(application.getStatus())
                .feedback(application.getFeedback())
                .submissionDate(application.getSubmissionDate())
                .build();
    }
}
