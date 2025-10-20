package org.bounswe.jobboardbackend.jobpost.service;

import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.jobpost.dto.CreateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.UpdateJobPostRequest;
import org.bounswe.jobboardbackend.jobpost.dto.JobPostResponse;
import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.bounswe.jobboardbackend.jobpost.repository.JobPostRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostService {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    public JobPostService(JobPostRepository jobPostRepository, UserRepository userRepository) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<JobPostResponse> getFiltered(String title, String companyName, List<String> ethicalTags, Integer minSalary, Integer maxSalary, Boolean isRemote, Boolean inclusiveOpportunity) {
        List<JobPost> jobs = jobPostRepository.findFiltered(title, companyName, minSalary, maxSalary, isRemote, inclusiveOpportunity);
        return jobs.stream()
                .filter(j -> {
                    if (ethicalTags == null || ethicalTags.isEmpty()) return true;
                    for (String tag : ethicalTags) {
                        if (j.getEthicalTags() != null && j.getEthicalTags().toLowerCase().contains(tag.toLowerCase())) return true;
                    }
                    return false;
                })
                .map(this::toResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobPostResponse> getByEmployerId(Long employerId) {
        return jobPostRepository.findByEmployerId(employerId).stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public JobPostResponse getById(Long id) {
        return jobPostRepository.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_POST_NOT_FOUND, "JobPost with ID " + id + " not found"));
    }

    @Transactional
    @PreAuthorize( "hasRole('ROLE_EMPLOYER')")
    public JobPostResponse create(CreateJobPostRequest dto) {
        User employer = getCurrentUser();


        JobPost job = JobPost.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .remote(dto.isRemote())
                .ethicalTags(dto.getEthicalTags())
                .inclusiveOpportunity(dto.isInclusiveOpportunity())
                .employer(employer)
                .minSalary(dto.getMinSalary())
                .maxSalary(dto.getMaxSalary())
                .contact(dto.getContact())
                .postedDate(LocalDateTime.now())
                .build();

        return toResponseDto(jobPostRepository.save(job));
    }

    @Transactional
    public void delete(Long id) {
        JobPost job = jobPostRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_POST_NOT_FOUND, "JobPost with ID " + id + " not found"));
        
        User currentUser = getCurrentUser();
        validateJobOwnership(job, currentUser);
        
        jobPostRepository.delete(job);
    }

    private JobPostResponse toResponseDto(JobPost job) {
        return JobPostResponse.builder()
                .id(job.getId())
                .employerId(job.getEmployer().getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .company(job.getCompany())
                .location(job.getLocation())
                .remote(job.isRemote())
                .ethicalTags(job.getEthicalTags())
                .inclusiveOpportunity(job.isInclusiveOpportunity())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .contact(job.getContact())
                .postedDate(job.getPostedDate())
                .build();
    }

    @Transactional
    public JobPostResponse update(Long id, UpdateJobPostRequest dto) {
        JobPost job = jobPostRepository.findById(id)
                .orElseThrow(() -> new HandleException(ErrorCode.JOB_POST_NOT_FOUND, "JobPost with ID " + id + " not found"));
        
        User currentUser = getCurrentUser();
        validateJobOwnership(job, currentUser);

        // Partial update: only update non-null fields
        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getCompany() != null) job.setCompany(dto.getCompany());
        if (dto.getLocation() != null) job.setLocation(dto.getLocation());
        if (dto.getRemote() != null) job.setRemote(dto.getRemote());
        if (dto.getEthicalTags() != null) job.setEthicalTags(dto.getEthicalTags());
        if (dto.getInclusiveOpportunity() != null) job.setInclusiveOpportunity(dto.getInclusiveOpportunity());
        if (dto.getMinSalary() != null) job.setMinSalary(dto.getMinSalary());
        if (dto.getMaxSalary() != null) job.setMaxSalary(dto.getMaxSalary());
        if (dto.getContact() != null) job.setContact(dto.getContact());

        return toResponseDto(jobPostRepository.save(job));
    }

    private User getCurrentUser() {
        String username = getCurrentUsername();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "Authenticated user not found in the system"));
    }

    private String getCurrentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new HandleException(ErrorCode.USER_UNAUTHORIZED, "No authentication context found");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userDetails.getUsername();
        }
        throw new HandleException(ErrorCode.INVALID_CREDENTIALS, "Invalid authentication context");
    }

    private void validateJobOwnership(JobPost job, User user) {
        if (job.getEmployer() == null) {
            throw new HandleException(ErrorCode.JOB_POST_CORRUPT, "Job post has no employer assigned");
        }
        if (!job.getEmployer().getId().equals(user.getId())) {
            throw new HandleException(ErrorCode.JOB_POST_FORBIDDEN, "Only the employer who posted the job can perform this action");
        }
    }

}
