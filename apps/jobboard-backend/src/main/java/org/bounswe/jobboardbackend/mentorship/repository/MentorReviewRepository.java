package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.mentorship.model.MentorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MentorReviewRepository extends JpaRepository<MentorReview, Long> {
    
    // Badge methods
    long countByReviewerId(Long reviewerId);

    void deleteByReviewerId(Long reviewerId);
}
