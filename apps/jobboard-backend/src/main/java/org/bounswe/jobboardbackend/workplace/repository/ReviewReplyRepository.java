package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
    Optional<ReviewReply> findByReview_Id(Long reviewId);

    boolean existsByReview_Id(Long reviewId);
}
