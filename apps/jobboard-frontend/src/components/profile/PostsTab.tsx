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
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
        >
          <h3 className="font-medium mb-2">{post.title}</h3>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>{post.replies} replies</span>
            <span>{post.likes} likes</span>
            <span>{post.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}