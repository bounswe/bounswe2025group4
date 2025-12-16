import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@shared/components/ui/input';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import { useForumPostsQuery, deletePost, updatePost, useCreateForumPostMutation } from '@modules/forum/services/forum.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { forumKeys } from '@shared/lib/query-keys';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { toast } from 'react-toastify';
import type { ForumPostResponseDTO } from '@shared/types/api.types';
import { useReportModal } from '@shared/hooks/useReportModal';
import PostCard from '@modules/forum/components/forum/PostCard';

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredPosts = q
      ? posts.filter((p) => {
          return (
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.authorUsername.toLowerCase().includes(q) ||
            p.tags?.some((t) => t.toLowerCase().includes(q))
          );
        })
      : posts;
    
    // Sort by createdAt descending (newest first)
    return [...filteredPosts].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }, [posts, query]);

  const renderSkeleton = () => (
    <div className="container mx-auto px-4 py-6 max-w-5xl" aria-busy="true">
      <span className="sr-only">{t('forum.loading')}</span>

      <div className="mb-4">
        <div className="h-9 w-48 bg-muted rounded animate-pulse mb-3" aria-hidden="true" />
        <div className="h-5 w-80 bg-muted rounded animate-pulse" aria-hidden="true" />
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-hidden="true">
        <div className="flex-1 h-10 w-full bg-muted rounded-md animate-pulse" />
        <div className="h-10 w-44 bg-muted rounded-md animate-pulse" />
      </div>

      <div className="grid grid-cols-1 gap-6" aria-hidden="true">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={`forum-post-skeleton-${index}`} className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-56 bg-muted rounded animate-pulse" />
                  <div className="h-8 w-4/5 bg-muted rounded animate-pulse" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-6 w-14 bg-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-full bg-muted rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-muted rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="h-9 w-44 bg-muted rounded-md animate-pulse" />
                <div className="h-6 w-28 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  if (isLoading) return renderSkeleton();
  if (isError) return <div className="container mx-auto p-6">{t('forum.loadError')}</div>;

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-4">
        <h1 className="text-3xl font-bold mb-2">{t('forum.title')}</h1>
        <p className="text-muted-foreground text-base">{t('forum.subtitle')}</p>
      </div>

      {/* Search + Create New Thread */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <Input
            className="text-base w-full bg-card"
            placeholder={t('forum.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              {t('forum.createNewThread')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">{t('forum.createNewThread')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('forum.titlePlaceholder')}
                className="text-base"
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('forum.contentPlaceholder')}
                className="min-h-32 text-base"
              />
              <Input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t('forum.tagsPlaceholder')}
                className="text-base"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                {t('common.cancel') || 'Cancel'}
              </Button>
              <Button
                onClick={async () => {
                  const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
                  try {
                    await createPostMutation.mutateAsync({ title, content, tags });
                    setIsCreateOpen(false);
                    setTitle('');
                    setContent('');
                    setTagsInput('');
                  } catch (_err) {
                    // error handled by mutation (toasts)
                  }
                }}
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? t('common.creating') || 'Creating...' : t('forum.create')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Posts List */}
      <div className="grid grid-cols-1 gap-6">
        {filtered.map((post) => {
          // Get most upvoted comment
          const topComment = (post.comments || [])
            .slice()
            .sort((a, b) => (b.upvoteCount - b.downvoteCount) - (a.upvoteCount - a.downvoteCount))[0];

          return (
            <PostCard
              key={post.id}
              post={post}
              topComment={topComment}
              user={user}
              onEdit={openEditDialog}
              onDelete={(id) => setDeletePostId(id)}
              openReport={openReport}
              t={t}
            />
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
            <DialogTitle className="text-xl">{t('forum.editPost.title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t('forum.titlePlaceholder')}
              className="text-base"
            />
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder={t('forum.contentPlaceholder')}
              className="min-h-32 text-base"
            />
            <Input
              value={editTagsInput}
              onChange={(e) => setEditTagsInput(e.target.value)}
              placeholder={t('forum.tagsPlaceholder')}
              className="text-base"
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
