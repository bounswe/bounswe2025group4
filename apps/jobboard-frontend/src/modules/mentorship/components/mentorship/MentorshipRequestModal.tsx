import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Textarea } from '@shared/components/ui/textarea';
import { Label } from '@shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import {
  useCreateMentorshipRequestMutation,
  useMenteeMentorshipsQuery,
} from '@modules/mentorship/services/mentorship.service';
import { useAuth } from '@/modules/auth/contexts/AuthContext';
import { normalizeApiError } from '@shared/utils/error-handler';
import type { MentorshipDetailsDTO } from '@shared/types/api.types';

interface MentorshipRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: number;
  mentorName?: string;
  isAvailable?: boolean;
  onSuccess?: () => void;
}

export default function MentorshipRequestModal({
  open,
  onOpenChange,
  mentorId,
  mentorName,
  isAvailable = true,
  onSuccess,
}: MentorshipRequestModalProps) {
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [motivation, setMotivation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasActiveMentorship, setHasActiveMentorship] = useState(false);
  
  const menteeMentorshipsQuery = useMenteeMentorshipsQuery(user?.id, Boolean(user?.id));
  const createRequestMutation = useCreateMentorshipRequestMutation();

  // Check for existing requests when modal opens
  useEffect(() => {
    if (open && user?.id) {
      const checkExistingRequest = async () => {
        try {
          const mentorships = menteeMentorshipsQuery.data ?? 
            (await menteeMentorshipsQuery.refetch()).data ?? 
            [];
          
          const existingRequest = mentorships.find(
            (m: MentorshipDetailsDTO) =>
              m.mentorId === mentorId &&
              (m.requestStatus?.toUpperCase() === 'PENDING' ||
                m.requestStatus?.toUpperCase() === 'ACCEPTED' ||
                m.reviewStatus?.toUpperCase() === 'ACTIVE')
          );
          
          setHasActiveMentorship(Boolean(existingRequest));
        } catch (err) {
          console.error('Error checking existing requests:', err);
        }
      };
      
      checkExistingRequest();
    }
  }, [open, user?.id, mentorId, menteeMentorshipsQuery]);

  // Close modal if user already has active mentorship
  useEffect(() => {
    if (open && hasActiveMentorship) {
      onOpenChange(false);
      setMotivation('');
    }
  }, [open, hasActiveMentorship, onOpenChange]);

  // Reset motivation when modal opens
  useEffect(() => {
    if (open && !hasActiveMentorship) {
      setMotivation('');
    }
  }, [open, hasActiveMentorship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent double submission
    if (isSubmitting || createRequestMutation.isPending) {
      return;
    }

    if (!user?.id) {
      toast.error(t('mentorship.profile.requestError') || 'Please log in to send a request');
      return;
    }

    // Double-check if user already has an active or pending request
    if (hasActiveMentorship) {
      onOpenChange(false);
      return;
    }

    const motivationText = motivation.trim();
    if (!motivationText) {
      toast.error(t('mentorship.request.motivationRequired') || 'Please provide a motivation message for your mentorship request.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createRequestMutation.mutateAsync({
        mentorId,
        motivation: motivationText,
      });
      
      setHasActiveMentorship(true);
      onOpenChange(false);
      setMotivation('');
      await menteeMentorshipsQuery.refetch();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        // Default behavior: navigate to my mentorships page
        navigate('/mentorship/my', {
          state: {
            showSuccess: true,
            mentorName,
            activeTab: 'pending',
          },
        });
      }
    } catch (err: unknown) {
      console.error('Error sending mentorship request:', err);
      const normalized = normalizeApiError(
        err,
        t('mentorship.request.errorMessage') ||
          'Failed to send mentorship request. Please try again.'
      );
      toast.error(normalized.friendlyMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMotivation('');
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {t('mentorship.request.title') || 'Request Mentorship'}
          </DialogTitle>
          <DialogDescription>
            {t('mentorship.request.description') || 'Tell the mentor about your goals and what you hope to achieve through mentorship.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="motivation" className="text-sm font-semibold">
              {t('mentorship.request.motivation') || 'Motivation'} <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="motivation"
              placeholder={t('mentorship.request.motivationPlaceholder') || 'Please explain why you want to be mentored by this mentor and what you hope to achieve...'}
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              rows={8}
              required
              disabled={!isAvailable || hasActiveMentorship || createRequestMutation.isPending}
              className="resize-y"
            />
            <p className="text-xs text-muted-foreground">
              {t('mentorship.request.motivationHint') || 'Share your goals, expectations, and what you hope to learn from this mentorship.'}
            </p>
          </div>


          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createRequestMutation.isPending || isSubmitting}
            >
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              type="submit"
              disabled={!isAvailable || createRequestMutation.isPending || hasActiveMentorship || isSubmitting}
            >
              {createRequestMutation.isPending || isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  {t('mentorship.request.sendingRequest') || 'Sending Request...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {t('mentorship.request.sendRequest') || 'Send Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}



