package org.bounswe.backend.job.service;


import org.bounswe.backend.common.enums.UserType;
import org.bounswe.backend.common.exception.NotFoundException;
import org.bounswe.backend.common.exception.UnauthorizedActionException;
import org.bounswe.backend.job.dto.JobPostDto;
import org.bounswe.backend.job.entity.JobPost;
import org.bounswe.backend.job.repository.JobPostRepository;
import org.bounswe.backend.user.entity.User;
import org.bounswe.backend.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class JobPostService {

    private final JobPostRepository repo;
    private final UserRepository userRepo;
    private final JobPostRepository jobPostRepository;

    public JobPostService(JobPostRepository repo, UserRepository userRepo, JobPostRepository jobPostRepository) {
        this.repo = repo;
        this.userRepo = userRepo;
        this.jobPostRepository = jobPostRepository;
    }


    public List<JobPostDto> getAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<JobPostDto> getFiltered(String title, String companyName, List<String> ethicalTags, Integer minSalary, Integer maxSalary, Boolean isRemote, String contact) {
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
                .map(this::toDto).collect(Collectors.toList());
    }

    public List<JobPostDto> getByEmployerId(Long employerId) {
        return repo.findByEmployerId(employerId).stream().map(this::toDto).collect(Collectors.toList());
    }

    public JobPostDto getById(Long id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NotFoundException("JobPost with ID " + id + " not found"));
    }


    public JobPostDto create(JobPostDto dto) {
        User employer = userRepo.findById(dto.getEmployerId())
                .orElseThrow(() -> new NotFoundException("Employer not found"));

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
                .build();

        return toDto(repo.save(job));
    }


    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new NotFoundException("Entity with ID " + id + " not found");
        }
        repo.deleteById(id);
    }

    private JobPostDto toDto(JobPost job) {
        return JobPostDto.builder()
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
                .build();
    }

    public JobPostDto update(Long id, JobPostDto dto) {
        JobPost job = repo.findById(id).orElseThrow(() -> new NotFoundException("JobPost with ID " + id + " not found"));

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        job.setRemote(dto.isRemote());
        job.setEthicalTags(dto.getEthicalTags());
        dto.setEmployerId(job.getEmployer().getId());
        job.setMinSalary(dto.getMinSalary());
        job.setMaxSalary(dto.getMaxSalary());
        job.setContact(dto.getContact());

        return toDto(repo.save(job));
    }

}
