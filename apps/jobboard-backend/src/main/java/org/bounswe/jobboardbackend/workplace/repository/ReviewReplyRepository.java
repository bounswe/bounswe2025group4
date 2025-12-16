package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
    Optional<ReviewReply> findByReview_Id(Long reviewId);

    void deleteByEmployerUserId(Long employerUserId);

    boolean existsByReview_Id(Long reviewId);

    void deleteAllByReview_Workplace_Id(Long workplaceId);
}
