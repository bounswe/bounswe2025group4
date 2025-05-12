package org.bounswe.backend.job.repository;

import org.bounswe.backend.job.entity.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {

    List<JobPost> findByEmployerId(Long employerId);
}
