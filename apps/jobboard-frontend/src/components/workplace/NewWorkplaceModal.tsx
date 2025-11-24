/**
 * NewWorkplaceModal Component
 * Modal dialog for choosing between creating a new workplace or joining an existing one
 */

import { Plus, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';

interface NewWorkplaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateWorkplace: () => void;
  onJoinWorkplace: () => void;
}

export function NewWorkplaceModal({
  open,
  onOpenChange,
  onCreateWorkplace,
  onJoinWorkplace,
}: NewWorkplaceModalProps) {
  const { t } = useTranslation('common');

  const handleCreateWorkplace = () => {
    onOpenChange(false);
    onCreateWorkplace();
  };

  const handleJoinWorkplace = () => {
    onOpenChange(false);
    onJoinWorkplace();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('workplace.newModal.title')}</DialogTitle>
          <DialogDescription>
            {t('workplace.newModal.description')}
          </DialogDescription>
        </DialogHeader>

        {/* Option cards */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {/* Create Workplace */}
          <Card
            className="w-64 cursor-pointer transition hover:bg-accent"
            onClick={handleCreateWorkplace}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-20 h-20 rounded-lg bg-primary/20 flex items-center justify-center">
                <Plus className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{t('workplace.newModal.createWorkplace')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('workplace.newModal.createWorkplaceDescription')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Join Workplace */}
          <Card
            className="w-64 cursor-pointer transition hover:bg-accent"
            onClick={handleJoinWorkplace}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-12 w-12 text-primary" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{t('workplace.newModal.joinWorkplace')}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {t('workplace.newModal.joinWorkplaceDescription')}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
