package org.bounswe.jobboardbackend.admin.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.bounswe.jobboardbackend.auth.model.User;
import org.bounswe.jobboardbackend.forum.service.ForumService;

@Service
@RequiredArgsConstructor
public class AdminForumService {

    private final ForumService forumService;

    @Transactional
    public void deletePost(Long postId, User adminUser, String reason) {
        forumService.deletePost(postId, adminUser);
    }

    @Transactional
    public void deleteComment(Long commentId, User adminUser, String reason) {
        forumService.deleteComment(commentId, adminUser);
    }
}
