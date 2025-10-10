package org.bounswe.jobboardbackend.jobpost.repository;

import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {

    List<JobPost> findByEmployerId(Long employerId);

    @Query(value = """
    SELECT * FROM job_posts j
    WHERE (:title IS NULL OR LOWER(CAST(j.title AS varchar)) LIKE LOWER(CONCAT(CAST(:title AS varchar), '%')))
    AND (:company IS NULL OR LOWER(CAST(j.company AS varchar)) LIKE LOWER(CONCAT(CAST(:company AS varchar), '%')))
    AND (:minSalary IS NULL OR CAST(j.min_salary AS integer) >= CAST(:minSalary AS integer))
    AND (:maxSalary IS NULL OR CAST(j.max_salary AS integer) <= CAST(:maxSalary AS integer))
    AND (:isRemote IS NULL OR CAST(j.remote AS boolean) = CAST(:isRemote AS boolean))
    AND (:inclusiveOpportunity IS NULL OR CAST(j.inclusive_opportunity AS boolean) = CAST(:inclusiveOpportunity AS boolean))
    """, nativeQuery = true)
    List<JobPost> findFiltered(
            @Param("title") String title,
            @Param("company") String company,
            @Param("minSalary") Integer minSalary,
            @Param("maxSalary") Integer maxSalary,
            @Param("isRemote") Boolean isRemote,
            @Param("inclusiveOpportunity") Boolean inclusiveOpportunity
    );

}
