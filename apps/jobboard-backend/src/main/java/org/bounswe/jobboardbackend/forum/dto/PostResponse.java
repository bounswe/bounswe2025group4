package org.bounswe.jobboardbackend.forum.dto;

import lombok.Builder;
import lombok.Data;
import org.bounswe.jobboardbackend.forum.model.ForumPost;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String authorUsername;
    private List<String> tags;
    private Instant createdAt;
    private Instant updatedAt;
    private int commentCount;
    private long upvoteCount;
    private long downvoteCount;
    private List<CommentResponse> comments;

    public static PostResponse from(ForumPost post, long upvoteCount, long downvoteCount,
            List<CommentResponse> comments) {
        return PostResponse.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .authorId(post.getAuthor().getId())
                .authorUsername(post.getAuthor().getUsername())
                .tags(post.getTags())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .commentCount(post.getComments() != null ? post.getComments().size() : 0)
                .upvoteCount(upvoteCount)
                .downvoteCount(downvoteCount)
                .comments(comments)
                .build();
    }
}
