package org.bounswe.jobboardbackend.forum.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.auth.repository.UserRepository;
import org.bounswe.jobboardbackend.exception.ApiError;
import org.bounswe.jobboardbackend.forum.dto.*;
import org.bounswe.jobboardbackend.forum.service.ForumService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Forum", description = "Forum Management API")
public class ForumController {

        private final ForumService forumService;
        private final UserRepository userRepository;

        private User getUser(UserDetails userDetails) {
                String username = userDetails.getUsername();
                return userRepository.findByUsername(username)
                                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        }

        private Long getUserIdOrNull(UserDetails userDetails) {
                if (userDetails == null) {
                        return null;
                }
                User user = getUser(userDetails);
                return user.getId();
        }

        @Operation(summary = "Create a Post", description = "Creates a new forum post. Authentication required.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Post created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Validation failed\", \"path\": \"/api/forum/posts\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts\" }")))
        })
        @PostMapping("/posts")
        public ResponseEntity<PostResponse> createPost(@AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody CreatePostRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createPost(user, request));
        }

        @Operation(summary = "List All Posts", description = "Retrieves all forum posts relative to the creation date. Includes user vote status if authenticated.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Posts retrieved successfully")
        })
        @GetMapping("/posts")
        public ResponseEntity<List<PostResponse>> findPosts(
                        @Parameter(description = "Optional user ID to filter posts by a specific user. If not provided, returns all posts.") @RequestParam(required = false) Long userId,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails) {
                Long currentUserId = getUserIdOrNull(userDetails);
                if (userId != null) {
                        return ResponseEntity.ok(forumService.findPostsByUserId(userId, currentUserId));
                }
                return ResponseEntity.ok(forumService.findAllPosts(currentUserId));
        }

        @Operation(summary = "Get Post by ID", description = "Retrieves a specific forum post by its ID. Includes user vote status if authenticated.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Post retrieved successfully"),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1\" }")))
        })
        @GetMapping("/posts/{id}")
        public ResponseEntity<PostResponse> findPostById(@PathVariable Long id,
                        @Parameter(hidden = true) @AuthenticationPrincipal UserDetails userDetails) {
                Long currentUserId = getUserIdOrNull(userDetails);
                return ResponseEntity.ok(forumService.findPostById(id, currentUserId));
        }

        @Operation(summary = "Update a Post", description = "Updates an existing forum post. Only the author can update their post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Post updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid post data\", \"path\": \"/api/forum/posts/1\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the author)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not the author of this post\", \"path\": \"/api/forum/posts/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1\" }")))
        })
        @PutMapping("/posts/{id}")
        public ResponseEntity<PostResponse> updatePost(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody UpdatePostRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(forumService.updatePost(id, user, request));
        }

        @Operation(summary = "Delete a Post", description = "Deletes a forum post. Only the author or an admin can delete it.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Post deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the author/admin)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not authorized to delete this post\", \"path\": \"/api/forum/posts/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1\" }")))
        })
        @DeleteMapping("/posts/{id}")
        public ResponseEntity<Void> deletePost(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.deletePost(id, user);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Upvote a Post", description = "Adds an upvote to the specified post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Post upvoted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1/upvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1/upvote\" }")))
        })
        @PostMapping("/posts/{id}/upvote")
        public ResponseEntity<Void> upvotePost(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.upvotePost(id, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Remove Upvote from Post", description = "Removes an upvote from the specified post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Upvote removed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1/upvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1/upvote\" }")))
        })
        @DeleteMapping("/posts/{id}/upvote")
        public ResponseEntity<Void> removePostUpvote(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.removePostUpvote(id, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Downvote a Post", description = "Adds a downvote to the specified post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Post downvoted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1/downvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1/downvote\" }")))
        })
        @PostMapping("/posts/{id}/downvote")
        public ResponseEntity<Void> downvotePost(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.downvotePost(id, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Remove Downvote from Post", description = "Removes a downvote from the specified post.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Downvote removed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1/downvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post not found\", \"path\": \"/api/forum/posts/1/downvote\" }")))
        })
        @DeleteMapping("/posts/{id}/downvote")
        public ResponseEntity<Void> removePostDownvote(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.removePostDownvote(id, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Add a Comment", description = "Adds a comment to a specified post. Can be a reply to another comment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Comment added successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid comment data\", \"path\": \"/api/forum/posts/1/comments\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/posts/1/comments\" }"))),
                        @ApiResponse(responseCode = "404", description = "Post or parent comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Post or parent comment not found\", \"path\": \"/api/forum/posts/1/comments\" }")))
        })
        @PostMapping("/posts/{id}/comments")
        public ResponseEntity<CommentResponse> createComment(@PathVariable Long id,
                        @AuthenticationPrincipal UserDetails userDetails,
                        @RequestBody CreateCommentRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.status(HttpStatus.CREATED).body(forumService.createComment(id, user, request));
        }

        @Operation(summary = "Update a Comment", description = "Updates an existing comment. Only the author can update their comment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Comment updated successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 400, \"error\": \"Bad Request\", \"code\": \"BAD_REQUEST\", \"message\": \"Invalid comment data\", \"path\": \"/api/forum/comments/1\" }"))),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/comments/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the author)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not the author of this comment\", \"path\": \"/api/forum/comments/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Comment not found\", \"path\": \"/api/forum/comments/1\" }")))
        })
        @PutMapping("/comments/{commentId}")
        public ResponseEntity<CommentResponse> updateComment(@PathVariable Long commentId,
                        @AuthenticationPrincipal UserDetails userDetails, @RequestBody UpdateCommentRequest request) {
                User user = getUser(userDetails);
                return ResponseEntity.ok(forumService.updateComment(commentId, user, request));
        }

        @Operation(summary = "Delete a Comment", description = "Deletes a comment. Only the author or an admin can delete it.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "204", description = "Comment deleted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/comments/1\" }"))),
                        @ApiResponse(responseCode = "403", description = "Forbidden (Not the author/admin)", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 403, \"error\": \"Forbidden\", \"code\": \"ACCESS_DENIED\", \"message\": \"You are not authorized to delete this comment\", \"path\": \"/api/forum/comments/1\" }"))),
                        @ApiResponse(responseCode = "404", description = "Comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Comment not found\", \"path\": \"/api/forum/comments/1\" }")))
        })
        @DeleteMapping("/comments/{commentId}")
        public ResponseEntity<Void> deleteComment(@PathVariable Long commentId,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.deleteComment(commentId, user);
                return ResponseEntity.noContent().build();
        }

        @Operation(summary = "Upvote a Comment", description = "Adds an upvote to the specified comment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Comment upvoted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/comments/1/upvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Comment not found\", \"path\": \"/api/forum/comments/1/upvote\" }")))
        })
        @PostMapping("/comments/{commentId}/upvote")
        public ResponseEntity<Void> upvoteComment(@PathVariable Long commentId,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.upvoteComment(commentId, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Remove Upvote from Comment", description = "Removes an upvote from the specified comment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Upvote removed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/comments/1/upvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Comment not found\", \"path\": \"/api/forum/comments/1/upvote\" }")))
        })
        @DeleteMapping("/comments/{commentId}/upvote")
        public ResponseEntity<Void> removeUpvote(@PathVariable Long commentId,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.removeUpvote(commentId, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Downvote a Comment", description = "Adds a downvote to the specified comment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Comment downvoted successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/comments/1/downvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Comment not found\", \"path\": \"/api/forum/comments/1/downvote\" }")))
        })
        @PostMapping("/comments/{commentId}/downvote")
        public ResponseEntity<Void> downvoteComment(@PathVariable Long commentId,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.downvoteComment(commentId, user);
                return ResponseEntity.ok().build();
        }

        @Operation(summary = "Remove Downvote from Comment", description = "Removes a downvote from the specified comment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Downvote removed successfully"),
                        @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 401, \"error\": \"Unauthorized\", \"code\": \"USER_UNAUTHORIZED\", \"message\": \"Full authentication is required\", \"path\": \"/api/forum/comments/1/downvote\" }"))),
                        @ApiResponse(responseCode = "404", description = "Comment not found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiError.class), examples = @ExampleObject(value = "{\"timestamp\": \"2023-10-01T12:00:00\", \"status\": 404, \"error\": \"Not Found\", \"code\": \"NOT_FOUND\", \"message\": \"Comment not found\", \"path\": \"/api/forum/comments/1/downvote\" }")))
        })
        @DeleteMapping("/comments/{commentId}/downvote")
        public ResponseEntity<Void> removeDownvote(@PathVariable Long commentId,
                        @AuthenticationPrincipal UserDetails userDetails) {
                User user = getUser(userDetails);
                forumService.removeDownvote(commentId, user);
                return ResponseEntity.ok().build();
        }
}
