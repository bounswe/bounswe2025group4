package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByWorkplace_Id(Long workplaceId, Pageable pageable);

    Page<Review> findByWorkplace_IdAndOverallRatingIn(Long workplaceId, List<Double> ratings, Pageable pageable);

    Page<Review> findByWorkplace_IdAndContentIsNotNullAndContentNot(Long workplaceId, String content,
            Pageable pageable);

    long countByWorkplace_Id(Long workplaceId);

    Page<Review> findByWorkplace_IdAndOverallRatingBetween(Long workplaceId, Double min, Double max, Pageable pageable);

    @Query("select avg(rpr.score) from ReviewPolicyRating rpr where rpr.review.workplace.id = :workplaceId")
    Double averageOverallByWorkplaceUsingPolicies(@Param("workplaceId") Long workplaceId);

    Optional<Review> findByIdAndWorkplace_Id(Long id, Long workplaceId);

    boolean existsByWorkplace_IdAndUser_Id(Long workplaceId, Long userId);

    List<Review> findByUserId(Long userId);

    void deleteAllByWorkplace_Id(Long workplaceId);
}