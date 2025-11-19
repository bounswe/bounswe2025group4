package org.bounswe.jobboardbackend.jobpost.repository;

import org.bounswe.jobboardbackend.jobpost.model.JobPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobPostRepository extends JpaRepository<JobPost, Long> {

    List<JobPost> findByEmployerId(Long employerId);
    
    List<JobPost> findByWorkplaceId(Long workplaceId);

    @Query(value = """
    SELECT j.* FROM job_posts j
    LEFT JOIN workplace w ON j.workplace_id = w.id
    WHERE (:title IS NULL OR LOWER(CAST(j.title AS varchar)) LIKE LOWER(CONCAT(CAST(:title AS varchar), '%')))
    AND (:companyName IS NULL OR LOWER(CAST(w.company_name AS varchar)) LIKE LOWER(CONCAT(CAST(:companyName AS varchar), '%')))
    AND (:location IS NULL OR LOWER(CAST(w.location AS varchar)) LIKE LOWER(CONCAT(CAST(:location AS varchar), '%')))
    AND (:sector IS NULL OR LOWER(CAST(w.sector AS varchar)) LIKE LOWER(CONCAT(CAST(:sector AS varchar), '%')))
    AND (:minSalary IS NULL OR CAST(j.min_salary AS integer) >= CAST(:minSalary AS integer))
    AND (:maxSalary IS NULL OR CAST(j.max_salary AS integer) <= CAST(:maxSalary AS integer))
    AND (:isRemote IS NULL OR CAST(j.remote AS boolean) = CAST(:isRemote AS boolean))
    AND (:inclusiveOpportunity IS NULL OR CAST(j.inclusive_opportunity AS boolean) = CAST(:inclusiveOpportunity AS boolean))
    AND (:nonProfit IS NULL OR CAST(j.non_profit AS boolean) = CAST(:nonProfit AS boolean))
    """, nativeQuery = true)
    List<JobPost> findFiltered(
            @Param("title") String title,
            @Param("companyName") String companyName,
            @Param("location") String location,
            @Param("sector") String sector,
            @Param("minSalary") Integer minSalary,
            @Param("maxSalary") Integer maxSalary,
            @Param("isRemote") Boolean isRemote,
            @Param("inclusiveOpportunity") Boolean inclusiveOpportunity,
            @Param("nonProfit") Boolean nonProfit
    );

}
