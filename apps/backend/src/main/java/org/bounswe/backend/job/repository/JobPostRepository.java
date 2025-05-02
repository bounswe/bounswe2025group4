package org.bounswe.backend.job.repository;

import org.bounswe.backend.job.entity.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {

}
