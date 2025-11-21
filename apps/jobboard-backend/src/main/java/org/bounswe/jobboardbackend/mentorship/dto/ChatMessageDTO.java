package org.bounswe.jobboardbackend.mentorship.dto;

import java.time.LocalDateTime;


public record ChatMessageDTO(
        String id,
        String conversationId,
        String senderId,
        String senderUsername,
        String content,
        LocalDateTime timestamp
) {}
