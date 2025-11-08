package org.bounswe.jobboardbackend.mentorship.service;

import org.bounswe.jobboardbackend.mentorship.dto.ChatMessageDTO;
import org.bounswe.jobboardbackend.mentorship.dto.CreateMessageDTO;
import org.bounswe.jobboardbackend.mentorship.model.ResumeReview;

import java.util.List;

public interface ChatService {

    void createConversationForReview(ResumeReview review);
    ChatMessageDTO saveAndBroadcastMessage(Long conversationId, CreateMessageDTO createMessageDTO, Long userId);
    List<ChatMessageDTO> getMessageHistory(Long conversationId, Long userId);

}