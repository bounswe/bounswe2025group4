package org.bounswe.jobboardbackend.forum.dto;

import lombok.Builder;
import lombok.Data;
import org.bounswe.jobboardbackend.forum.model.ForumComment;

import java.time.Instant;

@Data
@Builder
public class CommentResponse {
    private Long id;
    private String content;
    private Long authorId;
    private String authorUsername;
    private Long postId;
    private Long parentCommentId;
    private Instant createdAt;
    private Instant updatedAt;
    private long upvoteCount;
    private long downvoteCount;
    private boolean reported;

    public static CommentResponse from(ForumComment comment, long upvoteCount, long downvoteCount) {
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(comment.getAuthor().getId())
                .authorUsername(comment.getAuthor().getUsername())
                .postId(comment.getPost().getId())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .upvoteCount(upvoteCount)
                .downvoteCount(downvoteCount)
                .reported(comment.isReported())
                .build();
    }
}
