package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.mentorship.dto.MentorshipDetailsDTO;
import org.bounswe.jobboardbackend.mentorship.model.MentorshipRequest;
import org.bounswe.jobboardbackend.mentorship.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipRequestRepository extends JpaRepository<MentorshipRequest, Long> {
    List<MentorshipRequest> findByMentorId(Long mentorId);

    void deleteAllByMentorId(Long mentorId);

    @Query("SELECT new org.bounswe.jobboardbackend.mentorship.dto.MentorshipDetailsDTO(" +
            "mr.id, mr.status, mr.createdAt, " +
            "m.id, m.user.username, " +
            "rr.id, rr.status, " +
            "c.id" +
            ") " +
            "FROM MentorshipRequest mr " +
            "JOIN mr.mentor m " +
            "LEFT JOIN ResumeReview rr ON rr.mentorshipRequest.id = mr.id " +
            "LEFT JOIN Conversation c ON c.resumeReview.id = rr.id " +
            "WHERE mr.requester.id = :menteeId " +
            "ORDER BY mr.createdAt DESC")
    List<MentorshipDetailsDTO> findAllMentorshipDetailsByMenteeId(@Param("menteeId") Long menteeId);

    // Dashboard stats methods
    long countByStatus(RequestStatus status);
}