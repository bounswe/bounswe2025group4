package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.mentorship.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByResumeReviewId(Long id);
}
