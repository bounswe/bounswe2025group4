package org.bounswe.jobboardbackend.mentorship.controller;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.service.UserDetailsImpl;
import org.bounswe.jobboardbackend.mentorship.dto.ChatMessageDTO;
import org.bounswe.jobboardbackend.mentorship.dto.CreateMessageDTO;
import org.bounswe.jobboardbackend.mentorship.service.ChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Controller
@RestController
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat.sendMessage/{conversationId}")
    @SendTo("/topic/conversation/{conversationId}")
    public ChatMessageDTO sendMessage(
            @DestinationVariable Long conversationId,
            @Payload CreateMessageDTO createMessageDTO,
            Authentication auth
    ) {
        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        return chatService.saveAndBroadcastMessage(conversationId, createMessageDTO, userDetails.getId());
    }

    @GetMapping("/api/chat/history/{conversationId}")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(
            @PathVariable Long conversationId,
            Authentication auth
    ) {

         UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();

        List<ChatMessageDTO> history = chatService.getMessageHistory(conversationId,  userDetails.getId());
        return ResponseEntity.ok(history);
    }
}

