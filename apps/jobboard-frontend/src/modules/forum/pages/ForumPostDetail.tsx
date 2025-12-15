import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForumPostQuery, createComment as createCommentFn, updateComment as updateCommentFn, deleteComment as deleteCommentFn } from '@modules/forum/services/forum.service';
import Comment from '@modules/forum/components/forum/Comment';
import CommentForm from '@modules/forum/components/forum/CommentForm';
import LikeDislikeButtons from '@modules/forum/components/forum/LikeDislikeButtons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumKeys } from '@shared/lib/query-keys';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { toast } from 'react-toastify';
import { usePostVoting } from '@modules/forum/hooks/usePostVoting';
import { ArrowLeft, Flag } from 'lucide-react';
import { useReportModal } from '@shared/hooks/useReportModal';
import { reportForumPost } from '@modules/workplace/services/workplace-report.service';

const ForumPostDetail = () => {
  const { t } = useTranslation('common');
  const { postId } = useParams();
  const id = Number(postId);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { openReport, ReportModalElement } = useReportModal();

  const { data: post, isLoading, isError } = useForumPostQuery(id, Boolean(postId));

  const postVoting = usePostVoting({
    postId: id,
    initialUpvoteCount: post?.upvoteCount || 0,
    initialDownvoteCount: post?.downvoteCount || 0,
    initialUserUpvoted: post?.hasUserUpvoted,
    initialUserDownvoted: post?.hasUserDownvoted,
  });

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

  const renderSkeleton = () => (
    <div className="container mx-auto px-4 py-6 max-w-5xl" aria-busy="true">
      <span className="sr-only">{t('forum.loading')}</span>

      <div className="h-6 w-40 bg-muted rounded animate-pulse mb-6" aria-hidden="true" />

      <Card className="mb-6 shadow-sm" aria-hidden="true">
        <CardHeader className="px-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="h-5 w-64 bg-muted rounded animate-pulse" />
              <div className="h-9 w-4/5 bg-muted rounded animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                <div className="h-6 w-14 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
          </div>
        </CardHeader>

        <CardContent className="px-6 space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4/5 bg-muted rounded animate-pulse" />
          </div>

          <div className="pt-4 border-t">
            <div className="h-9 w-44 bg-muted rounded-md animate-pulse" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6" aria-hidden="true">
        <div className="h-8 w-56 bg-muted rounded animate-pulse" />

        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`forum-comment-skeleton-${index}`} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-10 bg-muted rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
              </div>
              <div className="mt-4 h-9 w-44 bg-muted rounded-md animate-pulse" />
            </div>
          ))}
        </div>

        <div className="pt-6 border-t">
          <div className="h-24 w-full bg-muted rounded-md animate-pulse" />
          <div className="mt-3 h-10 w-32 bg-muted rounded-md animate-pulse" />
        </div>
      </div>
    </div>
  );

  if (isLoading) return renderSkeleton();
  if (isError || !post) return <div className="container mx-auto p-6 text-base">{t('forum.postNotFound')}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      {/* Back Button */}
      <Link to="/forum" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-base">
        <ArrowLeft className="h-5 w-5" />
        {t('forum.backToForum') || 'Back to Forum'}
      </Link>

      {/* Post Card */}
      <Card className="mb-6 shadow-sm">
        <CardHeader className="px-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-base text-muted-foreground mb-3">
                <Link to={`/profile/${post.authorId}`} className="font-semibold hover:underline text-foreground">
                  {post.authorUsername}
                </Link>
                <span>•</span>
                <span className="text-sm">{new Date(post.createdAt).toLocaleString()}</span>
              </div>

              <h1 className="text-3xl font-bold mb-3">{post.title}</h1>

              <div className="flex flex-wrap gap-2">
                {post.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">{tag}</Badge>
                ))}
              </div>
            </div>
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  openReport({
                    title: t('forum.reportPost.title'),
                    subtitle: t('forum.reportPost.subtitle', { author: post.authorUsername }),
                    contextSnippet: post.content,
                    reportType: 'Post',
                    reportedName: post.authorUsername,
                    onSubmit: async (message: string) => {
                      await reportForumPost(post.id, message);
                    },
                  })
                }
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Flag className="h-5 w-5" />
                <span className="ml-2 text-sm font-medium">{t('common.report') || 'Report'}</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 space-y-6">
          <p className="whitespace-pre-wrap leading-relaxed text-base">{post.content}</p>

          {/* Voting UI */}
          <div className="pt-4 border-t">
            <LikeDislikeButtons
              likes={postVoting.upvoteCount}
              dislikes={postVoting.downvoteCount}
              onLike={postVoting.toggleUpvote}
              onDislike={postVoting.toggleDownvote}
              activeLike={postVoting.userUpvoted}
              activeDislike={postVoting.userDownvoted}
              likeLoading={postVoting.isLoading}
              dislikeLoading={postVoting.isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">
          {t('forum.comment.title')} ({post.commentCount})
        </h2>

        <div className="space-y-2">
          {post.comments.map((c) => (
            <Comment
              key={c.id}
              comment={{
                id: String(c.id),
                author: c.authorUsername,
                content: c.content,
                likes: c.upvoteCount,
                dislikes: c.downvoteCount,
                hasUserUpvoted: c.hasUserUpvoted,
                hasUserDownvoted: c.hasUserDownvoted,
              }}
              postId={id}
              isOwner={user?.id === c.authorId}
              onEdit={(commentId, newContent) => updateCommentMutation.mutate({ commentId: Number(commentId), content: newContent })}
              onDelete={(commentId) => deleteCommentMutation.mutate(Number(commentId))}
            />
          ))}
        </div>

        {/* Comment Form */}
        <div className="pt-6 border-t">
          <CommentForm onSubmit={(content) => createCommentMutation.mutate({ content })} />
        </div>
      </div>

      {ReportModalElement}
    </div>
  );
};

export default ForumPostDetail;
