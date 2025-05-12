package org.bounswe.backend.mentor.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.bounswe.backend.common.enums.MentorshipRequestStatus;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMentorshipRequestStatusDto {
    
    @NotNull(message = "Status is required")
    private MentorshipRequestStatus status;
}