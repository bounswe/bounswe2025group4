package org.bounswe.backend.mentor.repository;

import org.bounswe.backend.mentor.entity.MentorReview;
import org.bounswe.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorReviewRepository extends JpaRepository<MentorReview, Long> {
    List<MentorReview> findByMentor(User mentor);
    Optional<MentorReview> findByMentorAndMentee(User mentor, User mentee);

    @Query("SELECT AVG(r.rating) FROM MentorReview r WHERE r.mentor = :mentor")
    Double calculateAverageRatingByMentor(@Param("mentor") User mentor);

    @Query("SELECT COUNT(r) FROM MentorReview r WHERE r.mentor = :mentor")
    Integer countByMentor(@Param("mentor") User mentor);
}
