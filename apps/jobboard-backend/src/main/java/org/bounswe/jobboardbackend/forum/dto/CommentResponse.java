package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentDownvoteRepository;

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

    @Schema(description = "Whether the current user has upvoted this comment (null if user not authenticated)")
    private Boolean hasUserUpvoted;

    @Schema(description = "Whether the current user has downvoted this comment (null if user not authenticated)")
    private Boolean hasUserDownvoted;

    public static CommentResponse from(ForumComment comment, long upvoteCount, long downvoteCount) {
        return from(comment, upvoteCount, downvoteCount, null, null, null);
    }

    public static CommentResponse from(ForumComment comment, long upvoteCount, long downvoteCount,
            Long userId, ForumCommentUpvoteRepository upvoteRepo, ForumCommentDownvoteRepository downvoteRepo) {
        boolean isBanned = Boolean.TRUE.equals(comment.getAuthor().getIsBanned());

        // Check user vote status if userId and repositories provided
        Boolean hasUpvoted = null;
        Boolean hasDownvoted = null;
        if (userId != null && upvoteRepo != null && downvoteRepo != null) {
            hasUpvoted = upvoteRepo.findByUserIdAndCommentId(userId, comment.getId()).isPresent();
            hasDownvoted = downvoteRepo.findByUserIdAndCommentId(userId, comment.getId()).isPresent();
        }

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
                .hasUserUpvoted(hasUpvoted)
                .hasUserDownvoted(hasDownvoted)
                .build();
    }
}
