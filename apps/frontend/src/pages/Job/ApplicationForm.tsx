import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
} from '@mui/material';

interface ApplicationData {
  jobId: string;
  name: string;
  email: string;
  resume: File;
  coverLetter?: string;
}

interface ApplicationFormProps {
  jobId: string;
  open: boolean; // Control Dialog visibility from parent
  onClose: () => void;
  onSubmit: (applicationData: ApplicationData) => void;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({
  jobId,
  open,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [resume, setResume] = useState<File | null>(null);
  const [resumeName, setResumeName] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !resume) {
      alert('Please fill in all required fields (Name, Email, Resume).'); // Consider using MUI Snackbar for alerts
      return;
    }
    onSubmit({ jobId, name, email, resume, coverLetter });
    // Optionally clear form fields after submission
    setName('');
    setEmail('');
    setResume(null);
    setResumeName('');
    setCoverLetter('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResume(e.target.files[0]);
      setResumeName(e.target.files[0].name);
    }
  };

  const handleClose = () => {
    // Clear form on close as well if desired, or manage state from parent
    setName('');
    setEmail('');
    setResume(null);
    setResumeName('');
    setCoverLetter('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply for Job (ID: {jobId})</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              paddingTop: '8px',
            }}
          >
            <TextField
              label="Full Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button variant="contained" component="label" size="small">
                Upload Resume*
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  required
                />
              </Button>
              {resumeName && (
                <TextField
                  value={resumeName}
                  variant="standard"
                  slotProps={{
                    input: { readOnly: true, disableUnderline: true },
                  }}
                  size="small"
                  sx={{ flexGrow: 1 }}
                />
              )}
            </Box>
            <TextField
              label="Cover Letter (Optional)"
              variant="outlined"
              multiline
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Submit Application
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ApplicationForm;
