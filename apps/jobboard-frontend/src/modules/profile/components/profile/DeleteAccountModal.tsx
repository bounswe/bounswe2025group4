import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { useTranslation, Trans } from 'react-i18next';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

// Modal Base Component (copied from ProfileEditModals)
function Modal({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        <div className="sticky top-0 bg-card border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-destructive flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            {title}
          </h2>
          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: DeleteAccountModalProps): React.JSX.Element {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');
  const { t } = useTranslation('common');
  const confirmKeyword = t('profile.deleteModal.confirmKeyword');

  const handleClose = (): void => {
    setStep('warning');
    setConfirmText('');
    onClose();
  };

  const handleConfirm = async (): Promise<void> => {
    if (confirmText === confirmKeyword) {
      await onConfirm();
      handleClose();
    }
  };

  const isConfirmValid = confirmText === confirmKeyword;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={t('profile.deleteModal.title')}>
      {step === 'warning' && (
        <div className="space-y-6">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">{t('profile.deleteModal.warningTitle')}</span>
            </div>
            <p className="text-sm text-destructive/80">
              {t('profile.deleteModal.warningDescription')}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              {t('profile.deleteModal.summaryTitle')}
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• {t('profile.deleteModal.items.profilePicture')}</li>
              <li>• {t('profile.deleteModal.items.bio')}</li>
              <li>• {t('profile.deleteModal.items.experiences')}</li>
              <li>• {t('profile.deleteModal.items.education')}</li>
              <li>• {t('profile.deleteModal.items.skills')}</li>
            </ul>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              {t('profile.deleteModal.compliance')}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              {t('profile.deleteModal.buttons.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => setStep('confirm')}
              className="flex-1"
            >
              {t('profile.deleteModal.buttons.continue')}
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm">
              <Trans
                t={t}
                i18nKey="profile.deleteModal.confirmPrompt"
                values={{ keyword: confirmKeyword }}
                components={{ code: <code className="bg-muted px-2 py-1 rounded text-destructive font-mono font-bold" /> }}
              />
            </p>

            <div className="space-y-2">
              <label htmlFor="confirm-text" className="text-sm font-medium">
                {t('profile.deleteModal.confirmationLabel')}
              </label>
              <input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={t('profile.deleteModal.confirmationPlaceholder', { keyword: confirmKeyword })}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('warning')} className="flex-1">
              {t('profile.deleteModal.buttons.back')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isDeleting}
              className="flex-1"
            >
              {isDeleting
                ? t('profile.deleteModal.buttons.deleting')
                : t('profile.deleteModal.buttons.delete')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
