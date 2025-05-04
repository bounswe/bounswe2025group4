package org.bounswe.backend.thread.dto;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThreadDto {
    private Long id;
    private String title;
    private String body;
    private Long creatorId;
    private List<String> tags;
}
