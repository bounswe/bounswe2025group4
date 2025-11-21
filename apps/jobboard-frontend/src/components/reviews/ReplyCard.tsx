/**
 * ReplyCard Component
 * Displays an employer's reply to a review
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { Building2, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { ReplyFormDialog } from './ReplyFormDialog';
import { deleteReply } from '@/services/reviews.service';
import type { ReplyResponse } from '@/types/workplace.types';
import { useAuth } from '@/contexts/AuthContext';

interface ReplyCardProps {
  workplaceId: number;
  reviewId: number;
  reply: ReplyResponse;
  onUpdate?: () => void;
  onDelete?: () => void;
}

export function ReplyCard({
  workplaceId,
  reviewId,
  reply,
  onUpdate,
  onDelete,
}: ReplyCardProps) {
  const { t } = useTranslation('common');
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner = user?.id === reply.employerUserId;

  const handleDelete = async () => {
    if (!confirm(t('reviews.reply.confirmDelete'))) return;

    setIsDeleting(true);
    try {
      await deleteReply(workplaceId, reviewId);
      onDelete?.();
    } catch (error) {
      console.error('Failed to delete reply:', error);
      alert(t('reviews.reply.deleteError'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    onUpdate?.();
  };

  return (
    <>
      <Card className="border-l-4 border-l-primary/30 bg-muted/30">
        <CardContent>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">
                    {t('reviews.reply.employerResponse')}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(reply.createdAt), {
                    addSuffix: true,
                  })}
                  {reply.updatedAt !== reply.createdAt && (
                    <span className="ml-1">({t('common.edited')})</span>
                  )}
                </p>
              </div>
            </div>

            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={isDeleting}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? t('common.deleting') : t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <p className="text-sm whitespace-pre-wrap">{reply.content}</p>
        </CardContent>
      </Card>

      {isEditDialogOpen && (
        <ReplyFormDialog
          workplaceId={workplaceId}
          reviewId={reviewId}
          existingReply={reply}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
