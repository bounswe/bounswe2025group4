import { useState, type JSX } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}): JSX.Element | null {
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
}: DeleteAccountModalProps): JSX.Element {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  const handleClose = () => {
    setStep('warning');
    setConfirmText('');
    onClose();
  };

  const handleConfirm = async () => {
    if (confirmText === 'DELETE') {
      await onConfirm();
      handleClose();
    }
  };

  const isConfirmValid = confirmText === 'DELETE';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete Account Data">
      {step === 'warning' && (
        <div className="space-y-6">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Warning: This action cannot be undone</span>
            </div>
            <p className="text-sm text-destructive/80">
              This will permanently delete all your profile data.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium">
              The following data will be permanently deleted:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
              <li>• Profile picture</li>
              <li>• Bio and personal information</li>
              <li>• Work experiences</li>
              <li>• Education history</li>
              <li>• Skills and interests</li>
            </ul>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              This action is performed in compliance with GDPR/KVKK data protection regulations.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => setStep('confirm')}
              className="flex-1"
            >
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm">
              To confirm deletion, please type{' '}
              <code className="bg-muted px-2 py-1 rounded text-destructive font-mono font-bold">
                DELETE
              </code>{' '}
              in the field below:
            </p>

            <div className="space-y-2">
              <label htmlFor="confirm-text" className="text-sm font-medium">
                Confirmation
              </label>
              <input
                id="confirm-text"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE to confirm"
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={() => setStep('warning')} className="flex-1">
              Back
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={!isConfirmValid || isDeleting}
              className="flex-1"
            >
              {isDeleting ? 'Deleting...' : 'Delete All Data'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
