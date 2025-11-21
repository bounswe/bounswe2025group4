package org.bounswe.jobboardbackend.mentorship.config;

import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.security.JwtUtils;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final UserDetailsService uds;
    private final JwtUtils jwtUtils;



    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> auth = accessor.getNativeHeader("Authorization");
            if (auth != null && !auth.isEmpty()) {
                String raw = auth.get(0);
                if (raw.startsWith("Bearer ")) {
                    String jwt = raw.substring(7);

                    Authentication authentication =
                            jwtUtils.buildAuthenticationFromAccessToken(jwt, uds);

                    accessor.setUser(authentication);
                }
            }
        }
        return message;
    }
}
