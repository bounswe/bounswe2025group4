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
import org.bounswe.jobboardbackend.workplace.model.Workplace;
import org.bounswe.jobboardbackend.workplace.repository.WorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.repository.EmployerWorkplaceRepository;
import org.bounswe.jobboardbackend.workplace.service.WorkplaceService;
import org.springframework.security.access.AccessDeniedException;
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
    private final WorkplaceRepository workplaceRepository;
    private final EmployerWorkplaceRepository employerWorkplaceRepository;
    private final WorkplaceService workplaceService;

    public JobPostService(JobPostRepository jobPostRepository, 
                          UserRepository userRepository,
                          WorkplaceRepository workplaceRepository,
                          EmployerWorkplaceRepository employerWorkplaceRepository,
                          WorkplaceService workplaceService) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
        this.workplaceRepository = workplaceRepository;
        this.employerWorkplaceRepository = employerWorkplaceRepository;
        this.workplaceService = workplaceService;
    }

    @Transactional(readOnly = true)
    public List<JobPostResponse> getFiltered(String title, String companyName, List<String> ethicalTags, Integer minSalary, Integer maxSalary, Boolean isRemote, Boolean inclusiveOpportunity) {
        List<JobPost> jobs = jobPostRepository.findFiltered(title, companyName, minSalary, maxSalary, isRemote, inclusiveOpportunity);
        return jobs.stream()
                .filter(j -> {
                    // Filter by workplace ethical tags if specified
                    if (ethicalTags == null || ethicalTags.isEmpty()) return true;
                    if (j.getWorkplace() == null || j.getWorkplace().getEthicalTags() == null) return false;
                    
                    // Check if any of the requested tags match workplace's tags
                    for (String requestedTag : ethicalTags) {
                        if (j.getWorkplace().getEthicalTags().stream()
                                .anyMatch(policy -> policy.getLabel().equalsIgnoreCase(requestedTag))) {
                            return true;
                        }
                    }
                    return false;
                })
                .map(this::toResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobPostResponse> getByEmployerId(Long employerId) {

        // Verify employer exists
        userRepository.findById(employerId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "Employer with ID " + employerId + " not found"));
        
        return jobPostRepository.findByEmployerId(employerId).stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<JobPostResponse> getByWorkplaceId(Long workplaceId) {

        // Verify workplace exists
        workplaceRepository.findById(workplaceId)
                .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, "Workplace with ID " + workplaceId + " not found"));
        
        return jobPostRepository.findByWorkplaceId(workplaceId).stream().map(this::toResponseDto).collect(Collectors.toList());
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

        // Validate workplace exists
        Workplace workplace = workplaceRepository.findById(dto.getWorkplaceId())
                .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, 
                        "Workplace with ID " + dto.getWorkplaceId() + " not found"));

        // Check authorization: user must be employer of this workplace
        assertEmployerOfWorkplace(dto.getWorkplaceId(), employer.getId());

        JobPost job = JobPost.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .workplace(workplace)
                .remote(dto.isRemote())
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
                .workplace(workplaceService.toBriefResponse(job.getWorkplace()))
                .remote(job.isRemote())
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

        // Handle workplace change
        if (dto.getWorkplaceId() != null) {
            // Validate new workplace exists
            Workplace newWorkplace = workplaceRepository.findById(dto.getWorkplaceId())
                    .orElseThrow(() -> new HandleException(ErrorCode.WORKPLACE_NOT_FOUND, 
                            "Workplace with ID " + dto.getWorkplaceId() + " not found"));
            
            // Check authorization for new workplace
            assertEmployerOfWorkplace(dto.getWorkplaceId(), currentUser.getId());
            
            job.setWorkplace(newWorkplace);
        }

        // Partial update: only update non-null fields
        if (dto.getTitle() != null) job.setTitle(dto.getTitle());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        if (dto.getRemote() != null) job.setRemote(dto.getRemote());
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

    private void assertEmployerOfWorkplace(Long workplaceId, Long userId) {
        boolean isEmployer = employerWorkplaceRepository.existsByWorkplace_IdAndUser_Id(workplaceId, userId);
        if (!isEmployer) {
            throw new AccessDeniedException("You are not an employer of this workplace. Only employers of the workplace can post jobs for it.");
        }
    }

}
