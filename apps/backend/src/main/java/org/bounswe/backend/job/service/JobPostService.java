package org.bounswe.backend.job.service;


import org.bounswe.backend.common.enums.UserType;
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

    public JobPostService(JobPostRepository repo, UserRepository userRepo) {
        this.repo = repo;
        this.userRepo = userRepo;
    }


    public List<JobPostDto> getAll() {
        return repo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public JobPostDto getById(Long id) {
        return repo.findById(id).map(this::toDto).orElse(null);
    }

    public JobPostDto create(JobPostDto dto) {
        User employer = userRepo.findById(dto.getEmployerId())
                .orElseThrow(() -> new RuntimeException("Employer not found"));

        if (employer.getUserType() != UserType.EMPLOYER) {
            throw new RuntimeException("Only users with EMPLOYER type can post jobs.");
        }



        JobPost job = JobPost.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .company(dto.getCompany())
                .location(dto.getLocation())
                .remote(dto.isRemote())
                .ethicalTags(dto.getEthicalTags())
                .employer(employer)
                .build();

        return toDto(repo.save(job));
    }


    public void delete(Long id) {
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
                .build();
    }

    public JobPostDto update(Long id, JobPostDto dto) {
        JobPost job = repo.findById(id).orElseThrow();

        job.setTitle(dto.getTitle());
        job.setDescription(dto.getDescription());
        job.setCompany(dto.getCompany());
        job.setLocation(dto.getLocation());
        job.setRemote(dto.isRemote());
        job.setEthicalTags(dto.getEthicalTags());
        dto.setEmployerId(job.getEmployer().getId());


        return toDto(repo.save(job));
    }

}
