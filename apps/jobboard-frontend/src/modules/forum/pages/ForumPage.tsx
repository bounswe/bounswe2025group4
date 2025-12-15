import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import { Input } from '@shared/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import LikeDislikeButtons from '@modules/forum/components/forum/LikeDislikeButtons';
import { useForumPostsQuery, deletePost, updatePost } from '@modules/forum/services/forum.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upvotePost, downvotePost, useCreateForumPostMutation } from '@modules/forum/services/forum.service';
import { forumKeys } from '@shared/lib/query-keys';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { Trash2, Pencil, ShieldAlert } from 'lucide-react';
import { toast } from 'react-toastify';
import type { ForumPostResponseDTO } from '@shared/types/api.types';
import { useReportModal } from '@shared/hooks/useReportModal';
import { reportForumPost } from '@modules/workplace/services/workplace-report.service';

const truncate = (s: string, n = 250) => (s.length > n ? s.slice(0, n) + '…' : s);

const ForumPage = () => {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [editingPost, setEditingPost] = useState<ForumPostResponseDTO | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');
  const { data: posts = [], isLoading, isError } = useForumPostsQuery();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { openReport, ReportModalElement } = useReportModal();

  const createPostMutation = useCreateForumPostMutation();

  const deleteMutation = useMutation({
    mutationFn: (postId: number) => deletePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      toast.success(t('forum.deletePost.success'));
      setDeletePostId(null);
    },
    onError: () => {
      toast.error(t('forum.deletePost.error'));
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: { title?: string; content?: string; tags?: string[] } }) => 
      updatePost(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: forumKeys.posts });
      toast.success(t('forum.editPost.success'));
      setEditingPost(null);
    },
    onError: () => {
      toast.error(t('forum.editPost.error'));
    },
  });

  const openEditDialog = (post: ForumPostResponseDTO) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditTagsInput(post.tags?.join(', ') || '');
  };

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

  if (isLoading) return <div className="container mx-auto p-6">{t('forum.loading')}</div>;
  if (isError) return <div className="container mx-auto p-6">{t('forum.loadError')}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{t('forum.title')}</h1>
        <p className="text-muted-foreground text-sm">{t('forum.subtitle')}</p>
      </div>

      <div className="flex items-center justify-between gap-4 mb-4">
        <Input className="flex-1" placeholder={t('forum.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>{t('forum.createThread')}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('forum.createNewThread')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t('forum.titlePlaceholder')} />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder={t('forum.contentPlaceholder')} />
              <Input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder={t('forum.tagsPlaceholder')} />
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
                {t('forum.create')}
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
                    <Link to={`/forum/${post.id}`}>
                      <CardTitle className="text-lg hover:underline cursor-pointer">{post.title}</CardTitle>
                    </Link>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{t('forum.by')} <Link to={`/profile/${post.authorId}`} className="hover:underline text-primary">{post.authorUsername}</Link></span>
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">{t('forum.comments')}: {post.commentCount}</div>
                </div>
              </CardHeader>

              <CardContent className="px-4 space-y-4">
                <Link to={`/forum/${post.id}`} className="block">
                  <p className="text-sm leading-relaxed hover:underline cursor-pointer">{truncate(post.content, 300)}</p>
                </Link>

                {topComment && (
                  <div className="p-3 bg-muted rounded">
                    <div className="text-xs text-muted-foreground">{t('forum.topCommentFrom')} {topComment.authorUsername}</div>
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
                  <div className="flex items-center gap-1">
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
                          onSubmit: async (message) => {
                            await reportForumPost(post.id, message);
                          },
                        })
                      }
                    >
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                    </Button>
                    {user && user.id === post.authorId && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeletePostId(post.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletePostId !== null} onOpenChange={(open) => !open && setDeletePostId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('forum.deletePost.title')}</DialogTitle>
            <DialogDescription>
              {t('forum.deletePost.description')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletePostId(null)}>
              {t('forum.deletePost.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deletePostId !== null) {
                  deleteMutation.mutate(deletePostId);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? t('forum.deletePost.deleting') : t('forum.deletePost.confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={editingPost !== null} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('forum.editPost.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              placeholder={t('forum.titlePlaceholder')} 
            />
            <Textarea 
              value={editContent} 
              onChange={(e) => setEditContent(e.target.value)} 
              placeholder={t('forum.contentPlaceholder')} 
            />
            <Input 
              value={editTagsInput} 
              onChange={(e) => setEditTagsInput(e.target.value)} 
              placeholder={t('forum.tagsPlaceholder')} 
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>
              {t('forum.deletePost.cancel')}
            </Button>
            <Button
              onClick={() => {
                if (editingPost) {
                  const tags = editTagsInput.split(',').map((t) => t.trim()).filter(Boolean);
                  editMutation.mutate({
                    postId: editingPost.id,
                    data: { title: editTitle, content: editContent, tags },
                  });
                }
              }}
              disabled={editMutation.isPending}
            >
              {editMutation.isPending ? t('forum.editPost.saving') : t('forum.editPost.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {ReportModalElement}
    </div>
  );
};

export default ForumPage;
