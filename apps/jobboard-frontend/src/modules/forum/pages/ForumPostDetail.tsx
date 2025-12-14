import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForumPostQuery, createComment as createCommentFn, updateComment as updateCommentFn, deleteComment as deleteCommentFn, upvoteComment as upvoteCommentFn, downvoteComment as downvoteCommentFn, upvotePost as upvotePostFn, downvotePost as downvotePostFn } from '@modules/forum/services/forum.service';
import Comment from '@modules/forum/components/forum/Comment';
import CommentForm from '@modules/forum/components/forum/CommentForm';
import LikeDislikeButtons from '@modules/forum/components/forum/LikeDislikeButtons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumKeys } from '@shared/lib/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { toast } from 'react-toastify';

const ForumPostDetail = () => {
  const { t } = useTranslation('common');
  const { postId } = useParams();
  const id = Number(postId);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: post, isLoading, isError } = useForumPostQuery(id, Boolean(postId));

  const createCommentMutation = useMutation({
    mutationFn: (payload: { content: string }) => createCommentFn(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.post(id) });
      toast.success(t('forum.comment.addSuccess'));
    },
    onError: () => {
      toast.error(t('forum.comment.addError'));
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateCommentFn(commentId, { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteCommentFn(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
  });

  const upvoteCommentMutation = useMutation({
    mutationFn: (commentId: number) => upvoteCommentFn(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
  });

  const downvoteCommentMutation = useMutation({
    mutationFn: (commentId: number) => downvoteCommentFn(commentId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
  });

  const upvotePostMutation = useMutation({
    mutationFn: () => upvotePostFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
  });

  const downvotePostMutation = useMutation({
    mutationFn: () => downvotePostFn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
  });

  // Local maps to show active state until backend provides per-user flags
  const [postVote, setPostVote] = useState<'none' | 'like' | 'dislike'>('none');
  const [commentVotes, setCommentVotes] = useState<Record<number, 'none' | 'like' | 'dislike'>>({});
  const [, setUpvotingComments] = useState<number[]>([]);
  const [, setDownvotingComments] = useState<number[]>([]);

  const setCommentVote = (commentId: number, vote: 'none' | 'like' | 'dislike') => {
    setCommentVotes((prev) => ({ ...prev, [commentId]: vote }));
  };

  const setCommentLoading = (setter: React.Dispatch<React.SetStateAction<number[]>>, id: number, add: boolean) => {
    setter((prev) => (add ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  if (isLoading) return <div className="container mx-auto p-6">{t('forum.loading')}</div>;
  if (isError || !post) return <div className="container mx-auto p-6">{t('forum.postNotFound')}</div>;


  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="mb-4">
        <CardHeader className="px-4">
          <CardTitle className="text-xl">{post.title}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>{t('forum.by')} {post.authorUsername}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
          <div className="mt-4">
            <LikeDislikeButtons
              likes={post.upvoteCount}
              dislikes={post.downvoteCount}
              onLike={async () => {
                try {
                  await upvotePostMutation.mutateAsync();
                  setPostVote('like');
                } catch (err) {
                  // error handled by mutation toast
                }
              }}
              onDislike={async () => {
                try {
                  await downvotePostMutation.mutateAsync();
                  setPostVote('dislike');
                } catch (err) {}
              }}
              likeLoading={(upvotePostMutation as any).isLoading}
              dislikeLoading={(downvotePostMutation as any).isLoading}
              activeLike={postVote === 'like'}
              activeDislike={postVote === 'dislike'}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('forum.comment.title')} ({post.commentCount})</h2>

        <div className="space-y-3">
          {post.comments.map((c) => (
            <Comment
              key={c.id}
              comment={{ id: String(c.id), author: c.authorUsername, content: c.content, likes: c.upvoteCount, dislikes: c.downvoteCount }}
              isOwner={user?.id === c.authorId}
              onEdit={(commentId, newContent) => updateCommentMutation.mutate({ commentId: Number(commentId), content: newContent })}
              onDelete={(commentId) => deleteCommentMutation.mutate(Number(commentId))}
              onLike={async (commentId) => {
                try {
                  setCommentLoading(setUpvotingComments, c.id, true);
                  await upvoteCommentMutation.mutateAsync(Number(commentId));
                  setCommentVote(c.id, 'like');
                } finally {
                  setCommentLoading(setUpvotingComments, c.id, false);
                }
              }}
              onDislike={async (commentId) => {
                try {
                  setCommentLoading(setDownvotingComments, c.id, true);
                  await downvoteCommentMutation.mutateAsync(Number(commentId));
                  setCommentVote(c.id, 'dislike');
                } finally {
                  setCommentLoading(setDownvotingComments, c.id, false);
                }
              }}
              activeLike={commentVotes[c.id] === 'like'}
              activeDislike={commentVotes[c.id] === 'dislike'}
            />
          ))}
        </div>

        <div className="pt-4">
          <CommentForm onSubmit={(content) => createCommentMutation.mutate({ content })} />
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;
