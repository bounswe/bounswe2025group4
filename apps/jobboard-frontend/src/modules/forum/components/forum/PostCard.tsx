import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Button } from '@shared/components/ui/button';
import LikeDislikeButtons from '@modules/forum/components/forum/LikeDislikeButtons';
import { MessageSquare, Pencil, Trash2, Flag } from 'lucide-react';
import type { ForumPostResponseDTO, ForumCommentResponseDTO } from '@shared/types/api.types';
import type { User } from '@shared/types/auth.types';
import type { TFunction } from 'i18next';
import { usePostVoting } from '@modules/forum/hooks/usePostVoting';
import { useCommentVoting } from '@modules/forum/hooks/useCommentVoting';
import { reportForumPost, reportForumComment } from '@modules/workplace/services/workplace-report.service';
import type { ReportReasonType } from '@shared/components/report/ReportModal';

const truncate = (s: string, n = 250) => (s.length > n ? s.slice(0, n) + '…' : s);

interface OpenReportParams {
  title: string;
  subtitle?: string;
  contextSnippet?: string;
  reportType?: string;
  reportedName?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
  initialMessage?: string;
  onSubmit: (message: string, reason: ReportReasonType) => Promise<void> | void;
}

interface PostCardProps {
  post: ForumPostResponseDTO;
  topComment: ForumCommentResponseDTO | undefined;
  user: User | null;
  onEdit: (post: ForumPostResponseDTO) => void;
  onDelete: (id: number) => void;
  openReport: (params: OpenReportParams) => Promise<void>;
  t: TFunction;
}

const PostCard = ({ post, topComment, user, onEdit, onDelete, openReport, t }: PostCardProps) => {
  const navigate = useNavigate();
  const voting = usePostVoting({
    postId: post.id,
    initialUpvoteCount: post.upvoteCount,
    initialDownvoteCount: post.downvoteCount,
    initialUserUpvoted: post.hasUserUpvoted,
    initialUserDownvoted: post.hasUserDownvoted,
  });

  const commentVoting = useCommentVoting({
    commentId: topComment?.id ?? 0,
    postId: post.id,
    initialUpvoteCount: topComment?.upvoteCount ?? 0,
    initialDownvoteCount: topComment?.downvoteCount ?? 0,
    initialUserUpvoted: topComment?.hasUserUpvoted,
    initialUserDownvoted: topComment?.hasUserDownvoted,
  });

  const navigateToDetail = () => {
    navigate(`/forum/${post.id}`);
  };

  return (
    <Card
      className="group shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      role="link"
      tabIndex={0}
      aria-label={`Open post: ${post.title}`}
      onClick={(e) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        if (target.closest('a,button,input,textarea,select,[role="button"]')) return;
        navigateToDetail();
      }}
      onKeyDown={(e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        navigateToDetail();
      }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div
              className="flex items-center gap-2 text-base text-muted-foreground mb-2"
              onClick={(e) => e.stopPropagation()}
            >
              <Link to={`/profile/${post.authorId}`} className="font-semibold hover:underline text-foreground">
                {post.authorUsername}
              </Link>
              <span>•</span>
              <span className="text-sm">{new Date(post.createdAt).toLocaleString()}</span>
            </div>
            <Link to={`/forum/${post.id}`}>
              <h2 className="text-2xl font-bold hover:underline group-hover:underline cursor-pointer mb-2">{post.title}</h2>
            </Link>
            <div className="flex flex-wrap gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
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

      <CardContent className="space-y-4">
        <p className="text-base leading-relaxed text-foreground" onClick={(e) => e.stopPropagation()}>
          {truncate(post.content, 300)}
        </p>

        {/* Voting UI - Above Comments */}
        <div className="flex items-center justify-between pt-2 border-t">
          <LikeDislikeButtons
            likes={voting.upvoteCount}
            dislikes={voting.downvoteCount}
            onLike={voting.toggleUpvote}
            onDislike={voting.toggleDownvote}
            activeLike={voting.userUpvoted}
            activeDislike={voting.userDownvoted}
            likeLoading={voting.isLoading}
            dislikeLoading={voting.isLoading}
          />

          <div className="flex items-center gap-3">
            <Link
              to={`/forum/${post.id}`}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-medium">
                {post.commentCount}{' '}
                {post.commentCount === 1 ? t('forum.comment.title') || 'comment' : t('forum.comments') || 'comments'}
              </span>
            </Link>

            {user && user.id === post.authorId && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(post)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Single Comment Preview */}
        {topComment && (
          <div className="mt-4 pt-4 border-t">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground">{topComment.authorUsername}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      openReport({
                        title: t('forum.reportComment.title') || 'Report Comment',
                        subtitle: t('forum.reportComment.subtitle', { author: topComment.authorUsername }) || `Reporting comment by ${topComment.authorUsername}`,
                        contextSnippet: topComment.content,
                        reportType: 'Comment',
                        reportedName: topComment.authorUsername,
                        onSubmit: async (message: string, reason: ReportReasonType) => {
                          await reportForumComment(topComment.id, message, reason);
                        },
                      })
                    }
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-base text-foreground leading-relaxed">{truncate(topComment.content, 150)}</p>
              <div className="flex items-center pt-2 mt-2 border-t">
                <LikeDislikeButtons
                  likes={commentVoting.upvoteCount}
                  dislikes={commentVoting.downvoteCount}
                  onLike={commentVoting.toggleUpvote}
                  onDislike={commentVoting.toggleDownvote}
                  activeLike={commentVoting.userUpvoted}
                  activeDislike={commentVoting.userDownvoted}
                  likeLoading={commentVoting.isLoading}
                  dislikeLoading={commentVoting.isLoading}
                />
              </div>
              {post.commentCount > 1 && (
                <Link
                  to={`/forum/${post.id}`}
                  className="inline-block mt-3 text-sm font-medium text-primary hover:underline"
                >
                  {t('forum.seeAllComments', { count: post.commentCount }) || `See all ${post.commentCount} comments`}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* No comments state */}
        {!topComment && post.commentCount === 0 && (
          <Link to={`/forum/${post.id}`} className="block mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('forum.beFirstToComment') || 'Be the first to comment...'}
            </p>
          </Link>
        )}
      </CardContent>
    </Card>
  );
};

export default PostCard;
