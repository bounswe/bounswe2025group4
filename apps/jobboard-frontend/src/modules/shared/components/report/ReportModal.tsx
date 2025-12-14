import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';

export const ReportReason = {
  FAKE: 'FAKE',
  SPAM: 'SPAM',
  OFFENSIVE: 'OFFENSIVE',
  OTHER: 'OTHER',
} as const;

export type ReportReasonType = typeof ReportReason[keyof typeof ReportReason];

export interface ReportModalProps {
  open: boolean;
  onClose: () => void;

  // Context info
  title: string;
  subtitle?: string;
  contextSnippet?: string;
  reportType?: string;
  reportedName?: string;

  // Textarea configuration
  messageLabel?: string;
  messagePlaceholder?: string;
  initialMessage?: string;

  // Submission logic provided by caller
  onSubmit: (message: string, reason: ReportReasonType) => Promise<void> | void;

  // Optional loading indicator for lightweight open -> hydrate flow
  isLoading?: boolean;
}

export function ReportModal({
  open,
  onClose,
  title,
  subtitle,
  contextSnippet,
  reportType,
  reportedName,
  messageLabel = 'Explain why you are reporting this',
  messagePlaceholder = 'Please provide details...',
  initialMessage = '',
  onSubmit,
  isLoading = false,
}: ReportModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [reason, setReason] = useState<ReportReasonType>(ReportReason.OTHER);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      setReason(ReportReason.OTHER);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open, initialMessage]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) {
      setError('Please enter a message explaining the report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(message, reason);
      toast.success('Thank you, your report has been submitted.');
      onClose();
      setMessage('');
      setReason(ReportReason.OTHER);
    } catch (err) {
      console.error('Report submission failed:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [message, reason, onSubmit, onClose]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-6 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span>Loading…</span>
            </div>
          ) : (
            <>
              {(reportType || reportedName) && (
                <div className="flex flex-col gap-1 text-sm">
                  {reportType && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">Type:</span>
                      <span className="px-2 py-0.5 bg-secondary rounded-md text-secondary-foreground text-xs font-medium uppercase">
                        {reportType}
                      </span>
                    </div>
                  )}
                  {reportedName && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-muted-foreground">Author:</span>
                      <span className="font-medium">{reportedName}</span>
                    </div>
                  )}
                </div>
              )}

              {contextSnippet && (
                <div className="bg-muted/50 rounded-md p-3 text-sm italic text-muted-foreground border">
                  "{contextSnippet.length > 200 ? contextSnippet.slice(0, 200) + '...' : contextSnippet}"
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="report-reason">Reason</Label>
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as ReportReasonType)}
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value={ReportReason.FAKE}>Fake</option>
                  <option value={ReportReason.SPAM}>Spam</option>
                  <option value={ReportReason.OFFENSIVE}>Offensive</option>
                  <option value={ReportReason.OTHER}>Other</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-message">{messageLabel}</Label>
                <Textarea
                  id="report-message"
                  placeholder={messagePlaceholder}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (error) setError(null);
                  }}
                  className={error ? 'border-red-500 focus-visible:ring-red-500' : ''}
                  rows={4}
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading || !message.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
