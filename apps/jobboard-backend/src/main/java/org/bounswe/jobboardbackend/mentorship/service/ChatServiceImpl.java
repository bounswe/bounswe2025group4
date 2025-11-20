package org.bounswe.jobboardbackend.mentorship.service;


import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.mentorship.dto.ChatMessageDTO;
import org.bounswe.jobboardbackend.mentorship.dto.CreateMessageDTO;
import org.bounswe.jobboardbackend.mentorship.model.*;
import org.bounswe.jobboardbackend.mentorship.repository.ConversationRepository;
import org.bounswe.jobboardbackend.mentorship.repository.MessageRepository;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.mentorship.repository.ResumeReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatServiceImpl implements ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ResumeReviewRepository resumeReviewRepository;



    @Override
    @Transactional

    public void createConversationForReview(ResumeReview review) {
        Conversation conversation = new Conversation();
        conversation.setResumeReview(review);
        conversation.setCreatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);
    }

    @Override
    @Transactional
    public ChatMessageDTO saveAndBroadcastMessage(Long conversationId, CreateMessageDTO createMessageDTO, Long userId) {

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new HandleException(ErrorCode.USER_NOT_FOUND, "User not found"));
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new HandleException(ErrorCode.CONVERSATION_NOT_FOUND, "Conversation not found"));

        validateUserAccess(conversationId, userId);

        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(createMessageDTO.content());
        message.setTimestamp(LocalDateTime.now());

        Message savedMessage = messageRepository.save(message);

        return toChatMessageDTO(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getMessageHistory(Long conversationId, Long userId) {

        validateUserAccess(conversationId, userId);
        List<Message> messages = messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);

        return messages.stream()
                .map(this::toChatMessageDTO)
                .collect(Collectors.toList());
    }



    private void validateUserAccess(Long conversationId, Long userId) {
        conversationRepository.findById(conversationId)
                .orElseThrow(() -> new HandleException(ErrorCode.CONVERSATION_NOT_FOUND, "Conversation not found"));

        ResumeReview review = resumeReviewRepository.findByConversationId(conversationId)
                .orElseThrow(() -> new HandleException(ErrorCode.CHAT_NOT_LINKED_TO_REVIEW, "Chat is not linked to a review"));

        Long jobSeekerId = review.getJobSeeker().getId();
        Long mentorUserId = review.getMentor().getUser().getId();

        if (!userId.equals(jobSeekerId) && !userId.equals(mentorUserId)) {
            throw new HandleException(ErrorCode.UNAUTHORIZED_REVIEW_ACCESS, "User is not authorized for this conservation");
        }

    }

    private ChatMessageDTO toChatMessageDTO(Message message) {
        return new ChatMessageDTO(
                message.getId().toString(),
                message.getConversation().getId().toString(),
                message.getSender().getId().toString(),
                message.getSender().getUsername(),
                message.getContent(),
                message.getTimestamp()
        );
    }


}
