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
import { useCommentVoting } from '@modules/forum/hooks/useCommentVoting';
import type { ReportReasonType } from '@shared/components/report/ReportModal';

interface CommentProps {
  comment: {
    id: string;
    author: string;
    content: string;
    likes: number;
    dislikes: number;
    hasUserUpvoted?: boolean;
    hasUserDownvoted?: boolean;
  };
  postId: number;
  isOwner?: boolean;
  onEdit: (commentId: string, newContent: string) => void;
  onDelete: (commentId: string) => void;
}

const Comment = ({ comment, postId, isOwner = false, onEdit, onDelete }: CommentProps) => {
  const { t } = useTranslation('common');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(comment.content);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { openReport, ReportModalElement } = useReportModal();

  const voting = useCommentVoting({
    commentId: Number(comment.id),
    postId,
    initialUpvoteCount: comment.likes,
    initialDownvoteCount: comment.dislikes,
    initialUserUpvoted: comment.hasUserUpvoted,
    initialUserDownvoted: comment.hasUserDownvoted,
  });

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
      <Card className="shadow-sm">
        <CardContent className="px-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-base">{comment.author}</span>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  openReport({
                    title: t('forum.reportComment.title') || 'Report Comment',
                    subtitle: t('forum.reportComment.subtitle', { author: comment.author }) || `Reporting comment by ${comment.author}`,
                    contextSnippet: comment.content,
                    reportType: 'Comment',
                    reportedName: comment.author,
                    onSubmit: async (message: string, reason: ReportReasonType) => {
                      await reportForumComment(Number(comment.id), message, reason);
                    },
                  })
                }
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <Flag className="h-4 w-4" />
                <span className="ml-2 text-sm font-medium">{t('common.report') || 'Report'}</span>
              </Button>
            </div>
          </div>
        {isEditing ? (
          <div className="space-y-2">
            <Input
              value={editedContent}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEditedContent(e.target.value)}
              className="text-base"
            />
            <Button size="sm" onClick={handleEdit}>{t('forum.comment.save')}</Button>
          </div>
        ) : (
          <p className="text-base text-foreground leading-relaxed">{comment.content}</p>
        )}
        <div className="flex items-center pt-2 border-t">
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
