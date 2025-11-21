package org.bounswe.jobboardbackend.mentorship.repository;

import org.bounswe.jobboardbackend.mentorship.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findByConversationIdOrderByTimestampAsc(Long conversationId);
}
