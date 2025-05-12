// Component for the job application form
import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useFetcher } from 'react-router-dom'; // Use fetcher for form submission without navigation

interface ApplyFormProps {
  jobId: string;
}

const ApplyForm: React.FC<ApplyFormProps> = ({ jobId }) => {
  const fetcher = useFetcher();
  const [resumeFileName, setResumeFileName] = useState<string>('');

  const isSubmitting = fetcher.state === 'submitting';
  const submissionSuccess = fetcher.data?.success === true;
  const submissionError = fetcher.data?.error;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setResumeFileName(event.target.files[0].name);
    } else {
      setResumeFileName('');
    }
  };

  // Reset form state on successful submission
  React.useEffect(() => {
    if (submissionSuccess) {
      // fetcher.form?.reset(); // Doesn't work reliably with controlled file input state
      setResumeFileName('');
      // Consider showing a success message via Zustand store
    }
  }, [submissionSuccess]);

  return (
    <Box
      sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}
    >
      <Typography variant="h6" gutterBottom>
        Apply for this Job
      </Typography>
      {submissionSuccess ? (
        <Typography color="success.main" sx={{ mb: 2 }}>
          Application submitted successfully!
        </Typography>
      ) : (
        <fetcher.Form method="post" encType="multipart/form-data">
          {' '}
          {/* Use POST and multipart if sending files */}
          {/* Add hidden input for jobId if needed by action, though it's available via params */}
          {/* <input type="hidden" name="jobId" value={jobId} /> */}
          <TextField
            name="coverLetter" // Name matches expected field in action
            label="Cover Letter (Optional)"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            required
            disabled={isSubmitting}
          />
          <Button
            variant="contained"
            component="label"
            fullWidth
            sx={{ mt: 1, mb: 1 }}
            disabled={isSubmitting}
          >
            Upload Resume (Optional)
            <input
              type="file"
              hidden
              name="resumeFile" // Name matches expected field in action
              accept=".pdf,.doc,.docx" // Specify accepted file types
              onChange={handleFileChange}
              disabled={isSubmitting}
            />
          </Button>
          {resumeFileName && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Selected: {resumeFileName}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : null
            }
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
          {submissionError && (
            <Typography color="error" sx={{ mt: 2 }}>
              Error: {submissionError}
            </Typography>
          )}
        </fetcher.Form>
      )}
    </Box>
  );
};

export default ApplyForm;
