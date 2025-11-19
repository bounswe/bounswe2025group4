package org.bounswe.jobboardbackend.jobapplication.repository;

import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobSeekerId(Long jobSeekerId);

    List<JobApplication> findByJobPostId(Long jobPostId);
    
    List<JobApplication> findByJobPost_Workplace_Id(Long workplaceId);
    
    boolean existsByJobSeekerIdAndJobPostId(Long jobSeekerId, Long jobPostId);

    // needed for stats
    long countByStatus(org.bounswe.jobboardbackend.jobapplication.model.JobApplicationStatus status);
}
