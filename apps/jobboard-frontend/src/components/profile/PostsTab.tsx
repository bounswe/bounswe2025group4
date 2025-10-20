import { useTranslation } from 'react-i18next';

interface Post {
  id: number;
  title: string;
  replies: number;
  likes: number;
  date: string;
}

interface PostsTabProps {
  posts: Post[];
}

export function PostsTab({ posts }: PostsTabProps) {
  const { t } = useTranslation('common');

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-medium mb-2">{post.title}</h3>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>
              {t(
                post.replies === 1
                  ? 'profile.posts.replyLabel'
                  : 'profile.posts.repliesLabel',
                { value: post.replies },
              )}
            </span>
            <span>
              {t(
                post.likes === 1 ? 'profile.posts.likeLabel' : 'profile.posts.likesLabel',
                { value: post.likes },
              )}
            </span>
            <span>{post.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
