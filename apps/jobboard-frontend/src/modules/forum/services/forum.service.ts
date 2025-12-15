import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { api } from '@shared/lib/api-client';
import { forumKeys } from '@shared/lib/query-keys';
import { normalizeApiError } from '@shared/utils/error-handler';
import { useQueryWithToast } from '@shared/hooks/useQueryWithToast';
import type {
  ForumPostResponseDTO,
  ForumCommentResponseDTO,
  CreateForumPostRequest,
  UpdateForumPostRequest,
  CreateForumCommentRequest,
  UpdateForumCommentRequest,
} from '@shared/types/api.types';

// ============================================================================
// Forum Service
// ============================================================================

async function fetchPosts(): Promise<ForumPostResponseDTO[]> {
  const response = await api.get<ForumPostResponseDTO[]>('/forum/posts');
  return response.data;
}

async function fetchPostsByUserId(userId: number): Promise<ForumPostResponseDTO[]> {
  const response = await api.get<ForumPostResponseDTO[]>(`/forum/posts/user/${userId}`);
  return response.data;
}

async function fetchPost(postId: number): Promise<ForumPostResponseDTO> {
  const response = await api.get<ForumPostResponseDTO>(`/forum/posts/${postId}`);
  return response.data;
}

async function createPost(data: CreateForumPostRequest): Promise<ForumPostResponseDTO> {
  const response = await api.post<ForumPostResponseDTO>('/forum/posts', data);
  return response.data;
}

async function updatePost(
  postId: number,
  data: UpdateForumPostRequest,
): Promise<ForumPostResponseDTO> {
  const response = await api.put<ForumPostResponseDTO>(`/forum/posts/${postId}`, data);
  return response.data;
}

async function deletePost(postId: number): Promise<void> {
  await api.delete(`/forum/posts/${postId}`);
}

async function upvotePost(postId: number): Promise<void> {
  await api.post(`/forum/posts/${postId}/upvote`);
}

async function removePostUpvote(postId: number): Promise<void> {
  await api.delete(`/forum/posts/${postId}/upvote`);
}

async function downvotePost(postId: number): Promise<void> {
  await api.post(`/forum/posts/${postId}/downvote`);
}

async function removePostDownvote(postId: number): Promise<void> {
  await api.delete(`/forum/posts/${postId}/downvote`);
}

async function createComment(
  postId: number,
  data: CreateForumCommentRequest,
): Promise<ForumCommentResponseDTO> {
  const response = await api.post<ForumCommentResponseDTO>(`/forum/posts/${postId}/comments`, data);
  return response.data;
}

async function updateComment(
  commentId: number,
  data: UpdateForumCommentRequest,
): Promise<ForumCommentResponseDTO> {
  const response = await api.put<ForumCommentResponseDTO>(`/forum/comments/${commentId}`, data);
  return response.data;
}

async function deleteComment(commentId: number): Promise<void> {
  await api.delete(`/forum/comments/${commentId}`);
}

async function upvoteComment(commentId: number): Promise<void> {
  await api.post(`/forum/comments/${commentId}/upvote`);
}

async function removeCommentUpvote(commentId: number): Promise<void> {
  await api.delete(`/forum/comments/${commentId}/upvote`);
}

async function downvoteComment(commentId: number): Promise<void> {
  await api.post(`/forum/comments/${commentId}/downvote`);
}

async function removeCommentDownvote(commentId: number): Promise<void> {
  await api.delete(`/forum/comments/${commentId}/downvote`);
}

// Legacy exports
export {
  fetchPosts as getForumPosts,
  fetchPost as getForumPost,
  fetchPostsByUserId,
  createPost,
  updatePost,
  deletePost,
  upvotePost,
  removePostUpvote,
  downvotePost,
  removePostDownvote,
  createComment,
  updateComment,
  deleteComment,
  upvoteComment,
  removeCommentUpvote,
  downvoteComment,
  removeCommentDownvote,
};

// Hooks
export const useForumPostsQuery = (enabled = true) =>
  useQueryWithToast({
    queryKey: forumKeys.posts,
    queryFn: () => fetchPosts(),
    enabled,
  });

export const useForumPostQuery = (postId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: postId ? forumKeys.post(postId) : forumKeys.post('missing'),
    queryFn: () => fetchPost(postId as number),
    enabled: Boolean(postId) && enabled,
  });

export const useUserPostsQuery = (userId?: number, enabled = true) =>
  useQueryWithToast({
    queryKey: userId ? forumKeys.userPosts(userId) : forumKeys.userPosts('missing'),
    queryFn: () => fetchPostsByUserId(userId as number),
    enabled: Boolean(userId) && enabled,
  });

export const useCreateForumPostMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      // invalidate specific post (if backend returned it we already refetched posts)
      toast.success('Forum post created');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUpdateForumPostMutation = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateForumPostRequest) => updatePost(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      toast.success('Forum post updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteForumPostMutation = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      toast.success('Forum post deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useTogglePostUpvoteMutation = (postId: number, action: 'upvote' | 'removeUpvote') => {
  const queryClient = useQueryClient();
  const fn = action === 'upvote' ? () => upvotePost(postId) : () => removePostUpvote(postId);
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useTogglePostDownvoteMutation = (
  postId: number,
  action: 'downvote' | 'removeDownvote',
) => {
  const queryClient = useQueryClient();
  const fn = action === 'downvote' ? () => downvotePost(postId) : () => removePostDownvote(postId);
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useCreateCommentMutation = (postId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateForumCommentRequest) => createComment(postId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      toast.success('Comment created');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useUpdateCommentMutation = (commentId: number, postId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateForumCommentRequest) => updateComment(commentId, payload),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      toast.success('Comment updated');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useDeleteCommentMutation = (commentId: number, postId?: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => deleteComment(commentId),
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
      toast.success('Comment deleted');
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useToggleCommentUpvoteMutation = (
  commentId: number,
  postId?: number,
  action: 'upvote' | 'removeUpvote' = 'upvote',
) => {
  const queryClient = useQueryClient();
  const fn =
    action === 'upvote' ? () => upvoteComment(commentId) : () => removeCommentUpvote(commentId);
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};

export const useToggleCommentDownvoteMutation = (
  commentId: number,
  postId?: number,
  action: 'downvote' | 'removeDownvote' = 'downvote',
) => {
  const queryClient = useQueryClient();
  const fn =
    action === 'downvote'
      ? () => downvoteComment(commentId)
      : () => removeCommentDownvote(commentId);
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      if (postId) queryClient.invalidateQueries({ queryKey: forumKeys.post(postId) });
    },
    onError: (err) => toast.error(normalizeApiError(err).friendlyMessage),
  });
};
