package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.mentorship.model.MentorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    @Query("SELECT DISTINCT m FROM MentorProfile m LEFT JOIN FETCH m.mentorReviews")
    List<MentorProfile> findAllWithReviews();

}
