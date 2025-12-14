package org.bounswe.jobboardbackend.mentorship.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "Data Transfer Object for a chat message")
public record ChatMessageDTO(
                @Schema(description = "Unique identifier of the message", example = "msg-12345") String id,

                @Schema(description = "ID of the conversation", example = "10") String conversationId,

                @Schema(description = "ID of the sender", example = "5") String senderId,

                @Schema(description = "Username of the sender", example = "johndoe") String senderUsername,

                @Schema(description = "Content of the message", example = "Hello, how are you?") String content,

                @Schema(description = "Timestamp when the message was sent") LocalDateTime timestamp) {
}
