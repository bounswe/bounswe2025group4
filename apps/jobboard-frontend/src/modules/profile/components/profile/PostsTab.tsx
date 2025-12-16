import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { ForumPostResponseDTO } from '@shared/types/api.types';

interface PostsTabProps {
  posts: ForumPostResponseDTO[];
}

export function PostsTab({ posts }: PostsTabProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const handlePostClick = (postId: number) => {
    navigate(`/forum/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return t('profile.posts.oneDayAgo');
    if (diffDays < 7) return t('profile.posts.daysAgo', { days: diffDays });
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return t('profile.posts.weeksAgo', { weeks });
    }
    const months = Math.floor(diffDays / 30);
    return t('profile.posts.monthsAgo', { months });
  };

  return (
    <div className="space-y-3">
      {posts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{t('profile.posts.noPosts')}</p>
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            onClick={() => handlePostClick(post.id)}
            className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handlePostClick(post.id);
              }
            }}
            aria-label={`${post.title} - ${formatDate(post.createdAt)}`}
          >
            <h3 className="font-medium mb-2 text-foreground hover:text-green-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{post.content}</p>
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span>
                {t(
                  post.commentCount === 1
                    ? 'profile.posts.replyLabel'
                    : 'profile.posts.repliesLabel',
                  { value: post.commentCount },
                )}
              </span>
              <span>
                {t(
                  post.upvoteCount === 1 ? 'profile.posts.likeLabel' : 'profile.posts.likesLabel',
                  { value: post.upvoteCount },
                )}
              </span>
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
