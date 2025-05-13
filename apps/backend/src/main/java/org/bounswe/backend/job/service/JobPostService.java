package org.bounswe.backend.job.service;


import org.bounswe.backend.common.enums.UserType;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.common.exception.UnauthorizedActionException;
import org.bounswe.backend.job.dto.JobPostDto;
import org.bounswe.backend.job.dto.JobPostResponseDto;
import org.bounswe.backend.job.entity.JobPost;
import org.bounswe.backend.job.repository.JobPostRepository;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostService {

    private final JobPostRepository repo;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    public JobPostService(JobPostRepository repo, JobPostRepository jobPostRepository, UserRepository userRepository) {
        this.repo = repo;
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
    }


    public List<JobPostResponseDto> getAll() {
        return repo.findAll().stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public List<JobPostResponseDto> getFiltered(String title, String companyName, List<String> ethicalTags, Integer minSalary, Integer maxSalary, Boolean isRemote, String contact) {
        List<JobPost> jobs = jobPostRepository.findFiltered(title, companyName, minSalary, maxSalary, isRemote);
        return jobs.stream()
                .filter(j -> {
                    if (ethicalTags == null || ethicalTags.isEmpty()) return true;
                    for (String tag : ethicalTags) {
                        if (j.getEthicalTags().toLowerCase().contains(tag.toLowerCase())) return true;
                    }
                    return false;
                })
                .filter(j -> {
                    if (contact == null || contact.isEmpty()) return true;
                    return j.getContact() != null && j.getContact().toLowerCase().contains(contact.toLowerCase());
                })
                .map(this::toResponseDto).collect(Collectors.toList());
    }

    public List<JobPostResponseDto> getByEmployerId(Long employerId) {
        return repo.findByEmployerId(employerId).stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public JobPostResponseDto getById(Long id) {
        return repo.findById(id)
                .map(this::toResponseDto)
                .orElseThrow(() -> new NotFoundException("JobPost with ID " + id + " not found"));
    }


    public JobPostResponseDto create(JobPostDto dto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // This gets the username (email)
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Authenticated user not found in the system"));

        if (employer.getUserType() != UserType.EMPLOYER) {
            throw new UnauthorizedActionException("Only users with EMPLOYER type can post jobs.");
        }

        JobPost job = JobPost.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .remote(dto.isRemote())
                .ethicalTags(dto.getEthicalTags())
                .employer(employer)
                .minSalary(dto.getMinSalary())
                .maxSalary(dto.getMaxSalary())
                .contact(dto.getContact())
                .postedDate(LocalDateTime.now())
                .build();

        return toResponseDto(repo.save(job));
    }


    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Entity with ID " + id + " not found");
        }
        repo.deleteById(id);
    }

    private JobPostResponseDto toResponseDto(JobPost job) {
        return JobPostResponseDto.builder()
                .id(job.getId())
                .employerId(job.getEmployer().getId())
                .title(job.getTitle())
                .description(job.getDescription())
                .company(job.getCompany())
                .location(job.getLocation())
                .remote(job.isRemote())
                .ethicalTags(job.getEthicalTags())
                .minSalary(job.getMinSalary())
                .maxSalary(job.getMaxSalary())
                .contact(job.getContact())
                .postedDate(job.getPostedDate())
                .build();
    }

    public JobPostResponseDto update(Long id, JobPostDto dto) {

        JobPost job = repo.findById(id).orElseThrow(() -> new NotFoundException("JobPost with ID " + id + " not found"));
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName(); // This gets the username (email)
        User employer = userRepository.findByUsername(username)
                .orElseThrow(() -> new NotFoundException("Authenticated user not found in the system"));
        if (!job.getEmployer().getId().equals(employer.getId())) {
            throw new UnauthorizedActionException("Only the employer who posted the job can update it.");
        }

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        job.setRemote(dto.isRemote());
        job.setEthicalTags(dto.getEthicalTags());
        job.setMinSalary(dto.getMinSalary());
        job.setMaxSalary(dto.getMaxSalary());
        job.setContact(dto.getContact());

        return toResponseDto(repo.save(job));
    }

}
