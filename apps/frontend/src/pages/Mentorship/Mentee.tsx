import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Star as StarIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  useGetMentorProfiles,
  useGetMenteeRequests,
  useCreateMentorshipRequest,
} from '../../services/mentorship.service';
import { useCurrentUser } from '../../services/user.service';
import {
  MentorProfile,
  MentorshipRequest,
  RequestStatus,
} from '../../types/mentor';

const Mentee: React.FC = () => {
  const [selectedMentor, setSelectedMentor] = useState<MentorProfile | null>(
    null
  );
  const [requestMessage, setRequestMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get current user
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useCurrentUser();

  // Get all mentor profiles
  const {
    data: mentorProfiles,
    isLoading: isLoadingProfiles,
    error: profilesError,
  } = useGetMentorProfiles();

  // Get mentee requests
  const {
    data: menteeRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useGetMenteeRequests();

  // Create mentorship request mutation
  const createMentorshipRequest = useCreateMentorshipRequest();

  const handleRequestMentor = (mentor: MentorProfile) => {
    setSelectedMentor(mentor);
    setRequestMessage('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMentor(null);
  };

  const handleSubmitRequest = () => {
    if (!selectedMentor || !requestMessage.trim()) return;

    const requestData = {
      mentorId: selectedMentor.id,
      message: requestMessage.trim(),
    };

    createMentorshipRequest.mutate(requestData, {
      onSuccess: () => {
        setSnackbarMessage(`Request sent to ${selectedMentor.user.username}`);
        setSnackbarOpen(true);
        setDialogOpen(false);
        setSelectedMentor(null);
      },
      onError: (error) => {
        console.error('Failed to send request:', error);
        setSnackbarMessage('Failed to send request. Please try again.');
        setSnackbarOpen(true);
      },
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const getStatusChip = (status: RequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'ACCEPTED':
        return (
          <Chip
            label="Accepted"
            color="success"
            size="small"
            icon={<CheckCircleIcon />}
          />
        );
      case 'REJECTED':
        return (
          <Chip
            label="Rejected"
            color="error"
            size="small"
            icon={<CancelIcon />}
          />
        );
      case 'COMPLETED':
        return <Chip label="Completed" color="info" size="small" />;
      case 'CANCELLED':
        return <Chip label="Cancelled" color="default" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Show loading state
  if (isLoadingUser || isLoadingProfiles || isLoadingRequests) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 4,
        }}
      >
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading mentee dashboard...</Typography>
      </Box>
    );
  }

  // Show error state
  if (userError || profilesError || requestsError) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error">
          Error loading mentee dashboard. Please try again later.
        </Alert>
      </Box>
    );
  }

  // Filter for available mentors
  const availableMentors =
    mentorProfiles?.filter(
      (mentor) =>
        mentor.isAvailable && mentor.currentMenteeCount < mentor.capacity
    ) || [];

  // Filter for pending requests
  const pendingRequests =
    menteeRequests?.filter((req) => req.status === 'PENDING') || [];

  // Filter for active mentorships
  const activeMentorships =
    menteeRequests?.filter((req) => req.status === 'ACCEPTED') || [];

  // Filter for past mentorships
  const pastMentorships =
    menteeRequests?.filter(
      (req) =>
        req.status === 'COMPLETED' ||
        req.status === 'CANCELLED' ||
        req.status === 'REJECTED'
    ) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mentee Dashboard
      </Typography>

      {/* Available Mentors Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Available Mentors
      </Typography>
      {availableMentors.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          There are no mentors available at the moment. Please check back later.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {availableMentors.map((mentor) => (
            <Card key={mentor.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">{mentor.user.username}</Typography>
                  <Chip
                    label={`${mentor.currentMenteeCount}/${mentor.capacity} mentees`}
                    color="primary"
                    size="small"
                    sx={{ ml: 2 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <StarIcon sx={{ color: 'gold', fontSize: '1rem', mr: 0.5 }} />
                  <Typography variant="body2">
                    {mentor.averageRating.toFixed(1)}/5 ({mentor.reviewCount}{' '}
                    reviews)
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleRequestMentor(mentor)}
                  disabled={
                    pendingRequests.some(
                      (req) => req.mentor.id === mentor.user.id
                    ) ||
                    activeMentorships.some(
                      (req) => req.mentor.id === mentor.user.id
                    )
                  }
                >
                  Request Mentorship
                </Button>
                {pendingRequests.some(
                  (req) => req.mentor.id === mentor.user.id
                ) && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Request pending
                  </Typography>
                )}
                {activeMentorships.some(
                  (req) => req.mentor.id === mentor.user.id
                ) && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    Already your mentor
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Pending Requests Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Pending Requests{' '}
        {pendingRequests.length > 0 && `(${pendingRequests.length})`}
      </Typography>
      {pendingRequests.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You don't have any pending requests.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {pendingRequests.map((request) => (
            <Card key={request.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {request.mentor.username}
                  </Typography>
                  <Box sx={{ ml: 1 }}>{getStatusChip(request.status)}</Box>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Requested: {new Date(request.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  Your message: "{request.message}"
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => console.log('Cancelling request:', request.id)}
                >
                  Cancel Request
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Active Mentorships Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        Active Mentorships{' '}
        {activeMentorships.length > 0 && `(${activeMentorships.length})`}
      </Typography>
      {activeMentorships.length === 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          You don't have any active mentorships.
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {activeMentorships.map((mentorship) => (
            <Card key={mentorship.id}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PersonIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">
                    {mentorship.mentor.username}
                  </Typography>
                  <Box sx={{ ml: 1 }}>{getStatusChip(mentorship.status)}</Box>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Started:{' '}
                  {new Date(
                    mentorship.updatedAt || mentorship.createdAt
                  ).toLocaleDateString()}
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Button
                  variant="outlined"
                  onClick={() =>
                    console.log(
                      'Opening chat with mentor:',
                      mentorship.channelId
                    )
                  }
                >
                  Open Chat
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Past Mentorships Section */}
      {pastMentorships.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Past Mentorships ({pastMentorships.length})
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pastMentorships.map((mentorship) => (
              <Card key={mentorship.id} sx={{ opacity: 0.8 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PersonIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      {mentorship.mentor.username}
                    </Typography>
                    <Box sx={{ ml: 1 }}>{getStatusChip(mentorship.status)}</Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {mentorship.status === 'COMPLETED'
                      ? 'Completed'
                      : mentorship.status === 'CANCELLED'
                        ? 'Cancelled'
                        : 'Rejected'}
                    :{' '}
                    {new Date(
                      mentorship.updatedAt || mentorship.createdAt
                    ).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {/* Request Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Request Mentorship</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Write a message to {selectedMentor?.user.username} explaining why
            you'd like them to be your mentor and what you hope to learn.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Your Message"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            color="primary"
            variant="contained"
            disabled={!requestMessage.trim()}
          >
            Send Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default Mentee;
