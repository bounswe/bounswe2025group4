import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';

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
  onSubmit: (message: string) => Promise<void> | void;
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
}: ReportModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setMessage(initialMessage);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open, initialMessage]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message explaining the report.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(message);
      toast.success('Thank you, your report has been submitted.');
      onClose();
      setMessage('');
    } catch (err) {
      console.error('Report submission failed:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
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
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
