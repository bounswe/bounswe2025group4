package org.bounswe.jobboardbackend.forum.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumPostUpvoteRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostDownvoteRepository;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@Schema(description = "Response object representing a forum post")
public class PostResponse {
    @Schema(description = "Unique identifier of the post", example = "10")
    private Long id;

    @Schema(description = "Title of the post", example = "How to ace a job interview?")
    private String title;

    @Schema(description = "Content of the post", example = "I have an interview next week. Any tips?")
    private String content;

    @Schema(description = "ID of the author", example = "5")
    private Long authorId;

    @Schema(description = "Username of the author", example = "jobseeker123")
    private String authorUsername;

    @Schema(description = "Tags associated with the post", example = "[\"interview\", \"tips\"]")
    private List<String> tags;

    @Schema(description = "Timestamp when the post was created")
    private Instant createdAt;

    @Schema(description = "Timestamp when the post was last updated")
    private Instant updatedAt;

    @Schema(description = "Number of comments on the post", example = "5")
    private int commentCount;

    @Schema(description = "Number of upvotes", example = "10")
    private long upvoteCount;

    @Schema(description = "Number of downvotes", example = "1")
    private long downvoteCount;

    @Schema(description = "List of comments on the post")
    private List<CommentResponse> comments;

    @Schema(description = "Whether the current user has upvoted this post (null if user not authenticated)")
    private Boolean hasUserUpvoted;

    @Schema(description = "Whether the current user has downvoted this post (null if user not authenticated)")
    private Boolean hasUserDownvoted;

    public static PostResponse from(ForumPost post, long upvoteCount, long downvoteCount,
            List<CommentResponse> comments) {
        return from(post, upvoteCount, downvoteCount, comments, null, null, null);
    }

    public static PostResponse from(ForumPost post, long upvoteCount, long downvoteCount,
            List<CommentResponse> comments, Long userId,
            ForumPostUpvoteRepository upvoteRepo, ForumPostDownvoteRepository downvoteRepo) {
        boolean isBanned = Boolean.TRUE.equals(post.getAuthor().getIsBanned());

        // Check user vote status if userId and repositories provided
        Boolean hasUpvoted = null;
        Boolean hasDownvoted = null;
        if (userId != null && upvoteRepo != null && downvoteRepo != null) {
            hasUpvoted = upvoteRepo.findByUserIdAndPostId(userId, post.getId()).isPresent();
            hasDownvoted = downvoteRepo.findByUserIdAndPostId(userId, post.getId()).isPresent();
        }

        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(isBanned ? null : post.getAuthor().getId())
                .authorUsername(isBanned ? "Banned User" : post.getAuthor().getUsername())
                .tags(post.getTags())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(post.getComments() != null ? post.getComments().size() : 0)
                .upvoteCount(upvoteCount)
                .downvoteCount(downvoteCount)
                .comments(comments)
                .hasUserUpvoted(hasUpvoted)
                .hasUserDownvoted(hasDownvoted)
                .build();
    }
}
