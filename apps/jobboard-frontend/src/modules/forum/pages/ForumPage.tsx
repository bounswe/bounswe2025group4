import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Input } from '@shared/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import LikeDislikeButtons from '@modules/forum/components/forum/LikeDislikeButtons';
import { useForumPostsQuery } from '@modules/forum/services/forum.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvotePost, downvotePost, useCreateForumPostMutation } from '@modules/forum/services/forum.service';
import { forumKeys } from '@shared/lib/query-keys';

const truncate = (s: string, n = 250) => (s.length > n ? s.slice(0, n) + '…' : s);

const ForumPage = () => {
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const { data: posts = [], isLoading, isError } = useForumPostsQuery();
  const queryClient = useQueryClient();

  const createPostMutation = useCreateForumPostMutation();

  const upvoteMutation = useMutation({
    mutationFn: (postId: number) => upvotePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      // also refresh post detail cache if opened
      // note: forumKeys.post expects postId when invalidating; we don't have it here
    },
  });

  const downvoteMutation = useMutation({
    mutationFn: (postId: number) => downvotePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
    },
  });
  
  // Track per-post vote state minimally so we can show filled icons after server confirms
  const [postVotes, setPostVotes] = useState<Record<number, 'none' | 'like' | 'dislike'>>({});
  const [upvotingIds, setUpvotingIds] = useState<number[]>([]);
  const [downvotingIds, setDownvotingIds] = useState<number[]>([]);

  const setPostVote = (postId: number, vote: 'none' | 'like' | 'dislike') => {
    setPostVotes((prev) => ({ ...prev, [postId]: vote }));
  };

  const setLoadingId = (setter: React.Dispatch<React.SetStateAction<number[]>>, id: number, add: boolean) => {
    setter((prev) => (add ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.authorUsername.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query]);

  if (isLoading) return <div className="container mx-auto p-6">Loading...</div>;
  if (isError) return <div className="container mx-auto p-6">Failed to load posts</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Forum</h1>
        <p className="text-muted-foreground text-sm">Share knowledge, ask questions, and connect with the community</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <Input className="flex-1" placeholder="Search posts, authors or tags..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Thread</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a new thread</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Write your post here..." />
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="Tags (comma separated)" />
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
                  try {
                    await createPostMutation.mutateAsync({ title, content, tags });
                    setIsCreateOpen(false);
                    setTitle('');
                    setContent('');
                    setTagsInput('');
                  } catch (err) {
                    // error handled by mutation (toasts)
                  }
                }}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((post) => {
          const topComment = (post.comments || []).slice().sort((a, b) => b.upvoteCount - a.upvoteCount)[0];
          return (
            <Card key={post.id} className="relative gap-4 py-4">
              <CardHeader className="px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>By {post.authorUsername}</span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Comments: {post.commentCount}</div>
                </div>
              </CardHeader>

              <CardContent className="px-4 space-y-4">
                <p className="text-sm leading-relaxed">{truncate(post.content, 300)}</p>

                {topComment && (
                  <div className="p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">Top comment from {topComment.authorUsername}</div>
                    <div className="text-sm">{truncate(topComment.content, 200)}</div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <LikeDislikeButtons
                      likes={post.upvoteCount}
                      dislikes={post.downvoteCount}
                      onLike={async () => {
                        try {
                          setLoadingId(setUpvotingIds, post.id, true);
                          await upvoteMutation.mutateAsync(post.id);
                          setPostVote(post.id, 'like');
                        } finally {
                          setLoadingId(setUpvotingIds, post.id, false);
                        }
                      }}
                      onDislike={async () => {
                        try {
                          setLoadingId(setDownvotingIds, post.id, true);
                          await downvoteMutation.mutateAsync(post.id);
                          setPostVote(post.id, 'dislike');
                        } finally {
                          setLoadingId(setDownvotingIds, post.id, false);
                        }
                      }}
                      likeLoading={upvotingIds.includes(post.id)}
                      dislikeLoading={downvotingIds.includes(post.id)}
                      activeLike={postVotes[post.id] === 'like'}
                      activeDislike={postVotes[post.id] === 'dislike'}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/forum/${post.id}`} className="text-sm text-primary underline">View post</Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ForumPage;
