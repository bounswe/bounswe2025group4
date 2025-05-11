package org.bounswe.backend.mentor.repository;

import org.bounswe.backend.mentor.entity.MentorProfile;
import org.bounswe.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MentorProfileRepository extends JpaRepository<MentorProfile, Long> {
    Optional<MentorProfile> findByUser(User user);
    Optional<MentorProfile> findByUserId(Long userId);
    boolean existsByUserId(Long userId);
}