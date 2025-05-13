package org.bounswe.backend.comment.dto;
import lombok.*;
import org.bounswe.backend.user.dto.UserDto;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDto {
    private Long id;
    private String body;
    private UserDto author;
    private boolean reported;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
}
