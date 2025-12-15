package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import org.bounswe.jobboardbackend.forum.model.ForumComment;

import java.time.Instant;

@Data
@Builder
@Schema(description = "Response object representing a comment on a forum post")
public class CommentResponse {
    @Schema(description = "Unique identifier of the comment", example = "100")
    private Long id;

    @Schema(description = "Content of the comment", example = "I agree!")
    private String content;

    @Schema(description = "ID of the author", example = "5")
    private Long authorId;

    @Schema(description = "Username of the author", example = "jobseeker123")
    private String authorUsername;

    @Schema(description = "ID of the post this comment belongs to", example = "10")
    private Long postId;

    @Schema(description = "ID of the parent comment if this is a reply", example = "50")
    private Long parentCommentId;

    @Schema(description = "Timestamp when the comment was created")
    private Instant createdAt;

    @Schema(description = "Timestamp when the comment was last updated")
    private Instant updatedAt;

    @Schema(description = "Number of upvotes", example = "2")
    private long upvoteCount;

    @Schema(description = "Number of downvotes", example = "0")
    private long downvoteCount;

    public static CommentResponse from(ForumComment comment, long upvoteCount, long downvoteCount) {
        boolean isBanned = Boolean.TRUE.equals(comment.getAuthor().getIsBanned());
        return CommentResponse.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .authorId(isBanned ? null : comment.getAuthor().getId())
                .authorUsername(isBanned ? "Banned User" : comment.getAuthor().getUsername())
                .postId(comment.getPost().getId())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .upvoteCount(upvoteCount)
                .downvoteCount(downvoteCount)
                .build();
    }
}
