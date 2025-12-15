import type { ChangeEvent } from 'react';
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";
import { Input } from '@shared/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@shared/components/ui/dialog';
import LikeDislikeButtons from "./LikeDislikeButtons";
import { Flag } from 'lucide-react';
import { useReportModal } from '@shared/hooks/useReportModal';
import { reportForumComment } from '@modules/workplace/services/workplace-report.service';
import { toast } from 'react-toastify';

interface CommentProps {
  comment: {
    id: string;
    author: string;
    content: string;
    likes: number;
    dislikes: number;
  };
  isOwner?: boolean;
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
  onLike?: (commentId: string) => void;
  onDislike?: (commentId: string) => void;
  activeLike?: boolean;
  activeDislike?: boolean;
}

const Comment = ({ comment, isOwner = false, onEdit, onDelete, onLike, onDislike, activeLike, activeDislike }: CommentProps) => {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const likes = comment.likes;
  const dislikes = comment.dislikes;
  const { openReport, ReportModalElement } = useReportModal();
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);

  const handleEdit = () => {
    onEdit(comment.id, editedContent);
    setIsEditing(false);
    toast.success(t('forum.comment.editSuccess'));
  };

  const handleDelete = () => {
    onDelete(comment.id);
    setIsDeleteDialogOpen(false);
    toast.success(t('forum.comment.deleteSuccess'));
  };

  return (
    <>
      <Card className="gap-3 py-3">
        <CardContent className="px-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm">{comment.author}</span>
            <div className="flex items-center gap-2">
              {isOwner && (
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? t('forum.comment.cancel') : t('forum.comment.edit')}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                    {t('forum.comment.delete')}
                  </Button>
                </div>
              )}
              <button
                onClick={() =>
                  openReport({
                    title: 'Report Comment',
                    subtitle: `Reporting comment by ${comment.author}`,
                    contextSnippet: comment.content,
                    reportType: 'Comment',
                    reportedName: comment.author,
                    onSubmit: async (message) => {
                      await reportForumComment(Number(comment.id), message);
                    },
                  })
                }
                className="text-muted-foreground hover:text-destructive transition-colors p-1"
                title="Report Comment"
              >
                <Flag className="h-4 w-4" />
                <span className="sr-only">Report Comment</span>
              </button>
            </div>
          </div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editedContent}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedContent(e.target.value)}
            />
            <Button size="sm" onClick={handleEdit}>{t('forum.comment.save')}</Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
        )}
        <div className="flex items-center">
          <LikeDislikeButtons
            likes={likes}
            dislikes={dislikes}
            onLike={async () => {
              try {
                setLikeLoading(true);
                const res = onLike?.(comment.id);
                if (res && typeof (res as Promise<any>).then === 'function') {
                  await res;
                }
              } finally {
                setLikeLoading(false);
              }
            }}
            onDislike={async () => {
              try {
                setDislikeLoading(true);
                const res = onDislike?.(comment.id);
                if (res && typeof (res as Promise<any>).then === 'function') {
                  await res;
                }
              } finally {
                setDislikeLoading(false);
              }
            }}
            likeLoading={likeLoading}
            dislikeLoading={dislikeLoading}
            activeLike={activeLike}
            activeDislike={activeDislike}
          />
        </div>
      </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('forum.comment.deleteTitle')}</DialogTitle>
            <DialogDescription>
              {t('forum.comment.deleteDescription')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('forum.comment.cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('forum.comment.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {ReportModalElement}
    </>
  );
};

export default Comment;
