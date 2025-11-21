package org.bounswe.jobboardbackend.workplace.repository;

import org.bounswe.jobboardbackend.workplace.model.ReviewPolicyRating;
import org.bounswe.jobboardbackend.workplace.model.enums.EthicalPolicy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ReviewPolicyRatingRepository extends JpaRepository<ReviewPolicyRating, Long> {
    List<ReviewPolicyRating> findByReview_Id(Long reviewId);
    Page<ReviewPolicyRating> findByReview_Id(Long reviewId, Pageable pageable);

    List<ReviewPolicyRating> findByReview_IdAndPolicyIn(Long reviewId, Collection<EthicalPolicy> policies);

    @Query("select rpr.policy as policy, avg(rpr.score) as avgScore " +
           "from ReviewPolicyRating rpr " +
           "where rpr.review.workplace.id = :workplaceId " +
           "group by rpr.policy")
    List<Object[]> averageByPolicyForWorkplace(@Param("workplaceId") Long workplaceId);
}