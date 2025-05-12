package org.bounswe.backend.mentor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.backend.common.enums.MentorshipRequestStatus;
import org.bounswe.backend.user.dto.UserDto;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorshipRequestDto {
    private Long id;
    private UserDto mentor;
    private UserDto mentee;
    private String message;
    private MentorshipRequestStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String channelId;
}