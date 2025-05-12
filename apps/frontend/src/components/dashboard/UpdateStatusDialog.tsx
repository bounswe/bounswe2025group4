import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Application, ApplicationStatus } from '../../types/application';
import {
  applicationStatusSchema,
  ApplicationStatusUpdate,
} from '../../schemas/job';

interface UpdateStatusDialogProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onUpdateStatus: (applicationId: string, data: ApplicationStatusUpdate) => Promise<void>;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  open,
  application,
  onClose,
  onUpdateStatus,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationStatusUpdate>({
    resolver: zodResolver(applicationStatusSchema),
    defaultValues: {
      status: 'PENDING' as ApplicationStatus,
      feedback: '',
    },
  });

  React.useEffect(() => {
    if (application) {
      reset({
        status: application.status,
        feedback: application.feedback || '',
      });
    }
  }, [application, reset]);

  const onSubmit = async (data: ApplicationStatusUpdate) => {
    if (!application) return;

    setIsSubmitting(true);
    try {
      await onUpdateStatus(application.id, data);
      onClose();
    } catch (error) {
      console.error('Failed to update application status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!application) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update Application Status</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {application.applicantName} - {application.title}
            </Typography>

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <FormControl fullWidth sx={{ mt: 2 }} error={!!errors.status}>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    {...field}
                    labelId="status-label"
                    label="Status"
                    disabled={isSubmitting}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                  </Select>
                </FormControl>
              )}
            />

            <Controller
              name="feedback"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Feedback to Applicant"
                  fullWidth
                  multiline
                  rows={4}
                  sx={{ mt: 2 }}
                  error={!!errors.feedback}
                  helperText={errors.feedback?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
          >
            {isSubmitting ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UpdateStatusDialog; 