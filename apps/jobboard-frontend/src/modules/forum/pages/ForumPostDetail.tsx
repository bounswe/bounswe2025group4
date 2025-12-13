import { useParams } from 'react-router-dom';
import { useForumPostQuery, createComment as createCommentFn, updateComment as updateCommentFn, deleteComment as deleteCommentFn, upvoteComment as upvoteCommentFn, downvoteComment as downvoteCommentFn, upvotePost as upvotePostFn, downvotePost as downvotePostFn } from '@modules/forum/services/forum.service';
import Comment from '@modules/forum/components/forum/Comment';
import CommentForm from '@modules/forum/components/forum/CommentForm';
import LikeDislikeButtons from '@modules/forum/components/forum/LikeDislikeButtons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumKeys } from '@shared/lib/query-keys';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';

const ForumPostDetail = () => {
  const { postId } = useParams();
  const id = Number(postId);
  const queryClient = useQueryClient();

  const { data: post, isLoading, isError } = useForumPostQuery(id, Boolean(postId));

  const createCommentMutation = useMutation({
    mutationFn: (payload: { content: string }) => createCommentFn(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: forumKeys.post(id) }),
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

  if (isLoading) return <div className="container mx-auto p-6">Loading...</div>;
  if (isError || !post) return <div className="container mx-auto p-6">Post not found</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="mb-4">
        <CardHeader className="px-4">
          <CardTitle className="text-xl">{post.title}</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>By {post.authorUsername}</span>
            <span>•</span>
            <span>{new Date(post.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {post.tags?.map((t) => (
              <Badge key={t} variant="secondary" className="text-xs px-2 py-0.5">{t}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent className="px-4">
          <p className="whitespace-pre-wrap leading-relaxed">{post.content}</p>
          <div className="mt-4">
            <LikeDislikeButtons
              likes={post.upvoteCount}
              dislikes={post.downvoteCount}
              onLike={() => upvotePostMutation.mutate()}
              onDislike={() => downvotePostMutation.mutate()}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Comments ({post.commentCount})</h2>

        <div className="space-y-3">
          {post.comments.map((c) => (
            <Comment
              key={c.id}
              comment={{ id: String(c.id), author: c.authorUsername, content: c.content, likes: c.upvoteCount, dislikes: c.downvoteCount }}
              onEdit={(commentId, newContent) => updateCommentMutation.mutate({ commentId: Number(commentId), content: newContent })}
              onDelete={(commentId) => deleteCommentMutation.mutate(Number(commentId))}
              onLike={(commentId) => upvoteCommentMutation.mutate(Number(commentId))}
              onDislike={(commentId) => downvoteCommentMutation.mutate(Number(commentId))}
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
