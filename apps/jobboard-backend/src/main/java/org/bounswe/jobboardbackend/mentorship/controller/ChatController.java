package org.bounswe.jobboardbackend.mentorship.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.bounswe.jobboardbackend.mentorship.dto.ChatMessageDTO;
import org.bounswe.jobboardbackend.mentorship.dto.CreateMessageDTO;
import org.bounswe.jobboardbackend.mentorship.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Chat", description = "Chat and Messaging API")
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage/{conversationId}")
    @SendTo("/topic/conversation/{conversationId}")
    public ChatMessageDTO sendMessage(
            @DestinationVariable Long conversationId,
            @Payload CreateMessageDTO createMessageDTO,
            Authentication auth) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return chatService.saveAndBroadcastMessage(conversationId, createMessageDTO, userDetails.getId());
    }

    @Operation(summary = "Get Chat History", description = "Retrieves the message history for a specific conversation.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chat history retrieved successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 401, \"error\": \"Unauthorized\", \"message\": \"Full authentication is required\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "403", description = "Forbidden (Not a participant)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 403, \"error\": \"Forbidden\", \"message\": \"You are not a participant in this conversation\", \"timestamp\": \"2023-12-14T12:00:00\"}"))),
            @ApiResponse(responseCode = "404", description = "Conversation not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"status\": 404, \"error\": \"Not Found\", \"message\": \"Conversation not found\", \"timestamp\": \"2023-12-14T12:00:00\"}")))
    })
    @GetMapping("/api/chat/history/{conversationId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @Parameter(description = "ID of the conversation") @PathVariable Long conversationId,
            Authentication auth) {

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        List<ChatMessageDTO> history = chatService.getMessageHistory(conversationId, userDetails.getId());
        return ResponseEntity.ok(history);
    }
}
