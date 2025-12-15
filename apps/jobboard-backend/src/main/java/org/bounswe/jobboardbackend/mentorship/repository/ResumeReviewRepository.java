package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.mentorship.model.ResumeReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ResumeReviewRepository extends JpaRepository<ResumeReview, Long> {

    Optional<ResumeReview> findByConversationId(Long conversationId);

    void deleteByJobSeekerId(Long jobSeekerId);
}