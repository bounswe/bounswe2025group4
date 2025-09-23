package org.bounswe.backend.application.repository;

import org.bounswe.backend.application.entity.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    List<JobApplication> findByJobSeekerId(Long jobSeekerId);
    
    List<JobApplication> findByJobPostingId(Long jobPostingId);
}
