package org.bounswe.jobboardbackend.jobapplication.repository;

import org.bounswe.jobboardbackend.jobapplication.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobSeekerId(Long jobSeekerId);

    List<JobApplication> findByJobPostId(Long jobPostId);
}
