package org.bounswe.backend.mentor.repository;

import org.bounswe.backend.mentor.entity.MentorshipRequest;
import org.bounswe.backend.common.enums.MentorshipRequestStatus;
import org.bounswe.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByMentor(User mentor);
    List<MentorshipRequest> findByMentee(User mentee);
    Optional<MentorshipRequest> findByMentorAndMenteeAndStatus(User mentor, User mentee, MentorshipRequestStatus status);
}
