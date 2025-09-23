package org.bounswe.backend.thread.dto;
import lombok.*;
import java.util.List;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreadDto {
    private Long id;
    private String title;
    private String body;
    private Long creatorId;
    private String creatorUsername;
    private List<String> tags;
    private boolean reported;
    private LocalDateTime createdAt;
    private LocalDateTime editedAt;
    private int commentCount;
}
