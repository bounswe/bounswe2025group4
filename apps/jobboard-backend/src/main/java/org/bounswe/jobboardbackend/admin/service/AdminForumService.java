package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.bounswe.jobboardbackend.exception.ErrorCode;
import org.bounswe.jobboardbackend.exception.HandleException;
import org.bounswe.jobboardbackend.forum.model.ForumComment;
import org.bounswe.jobboardbackend.forum.model.ForumPost;
import org.bounswe.jobboardbackend.forum.repository.ForumCommentRepository;
import org.bounswe.jobboardbackend.forum.repository.ForumPostRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminForumService {

    private final ForumPostRepository forumPostRepository;
    private final ForumCommentRepository forumCommentRepository;

    @Transactional
    public void deletePost(Long postId, String reason) {
        ForumPost post = forumPostRepository.findById(postId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Forum post not found"));
        forumPostRepository.delete(post);

        // TODO: Log deletion with reason for audit
    }

    @Transactional
    public void deleteComment(Long commentId, String reason) {
        ForumComment comment = forumCommentRepository.findById(commentId)
                .orElseThrow(() -> new HandleException(ErrorCode.NOT_FOUND, "Forum comment not found"));

        forumCommentRepository.delete(comment);

        // TODO: Log deletion with reason for audit
    }
}
