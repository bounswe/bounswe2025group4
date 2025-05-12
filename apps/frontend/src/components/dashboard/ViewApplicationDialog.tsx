import React from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { Application } from '../../types/application';

interface ViewApplicationDialogProps {
  open: boolean;
  application: Application | null;
  onClose: () => void;
  onUpdateStatus: (application: Application) => void;
}

const ViewApplicationDialog: React.FC<ViewApplicationDialogProps> = ({
  open,
  application,
  onClose,
  onUpdateStatus,
}) => {
  if (!application) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Application Details</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            {application.applicantName}
          </Typography>

          <Typography variant="subtitle1" gutterBottom>
            {application.title} at {application.company}
          </Typography>

          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Applied on:{' '}
            {new Date(application.submissionDate).toLocaleDateString()}
          </Typography>

          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body1">
              Status: {application.status}
            </Typography>
          </Box>

          {application.feedback && (
            <>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Feedback
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {application.feedback}
              </Typography>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onClose();
            onUpdateStatus(application);
          }}
        >
          Update Status
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewApplicationDialog;
