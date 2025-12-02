package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.ReviewReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewReactionRepository extends JpaRepository<ReviewReaction, Long> {
    boolean existsByReview_IdAndUser_Id(Long reviewId, Long userId);

    Optional<ReviewReaction> findByReview_IdAndUser_Id(Long reviewId, Long userId);

    List<ReviewReaction> findByUser_IdAndReview_IdIn(Long userId, List<Long> reviewIds);
}
