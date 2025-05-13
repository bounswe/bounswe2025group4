import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import {
  useGetMentorProfileByUserId,
  useGetMentorRequests,
  useUpdateMentorshipRequestStatus,
} from '../../services/mentorship.service';
import { useCurrentUser } from '../../services/user.service';
import { MentorshipRequest, RequestStatus } from '../../types/mentor';

const Mentor: React.FC = () => {
  const [selectedRequest, setSelectedRequest] =
    useState<MentorshipRequest | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'accept' | 'reject' | null>(
    null
  );
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get current user
  const {
    data: currentUser,
    isLoading: isLoadingUser,
    error: userError,
  } = useCurrentUser();

  // Get mentor profile if it exists
  const {
    data: mentorProfile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useGetMentorProfileByUserId(currentUser?.id || 0);

  // Create mentorship request status update mutation
  const updateRequestStatus = useUpdateMentorshipRequestStatus();

  // Get mentor requests
  const {
    data: mentorRequests,
    isLoading: isLoadingRequests,
    error: requestsError,
  } = useGetMentorRequests();

  // Calculate capacity usage
  const capacityUsage = mentorProfile
    ? (mentorProfile.currentMenteeCount / mentorProfile.capacity) * 100
    : 0;

  const handleAcceptRequest = (request: MentorshipRequest) => {
    setSelectedRequest(request);
    setDialogAction('accept');
    setDialogOpen(true);
  };

  const handleRejectRequest = (request: MentorshipRequest) => {
    setSelectedRequest(request);
    setDialogAction('reject');
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (!selectedRequest || !dialogAction) return;

    const newStatus = dialogAction === 'accept' ? 'ACCEPTED' : 'REJECTED';

    updateRequestStatus.mutate(
      {
        requestId: selectedRequest.id,
        status: newStatus,
      },
      {
        onSuccess: (data) => {
          setSnackbarMessage(
            `${dialogAction === 'accept' ? 'Accepted' : 'Rejected'} mentorship request from ${selectedRequest.mentee.username}`
          );
          setSnackbarOpen(true);
        },
        onError: (error) => {
          console.error(`Failed to ${dialogAction} request:`, error);
          setSnackbarMessage(
            `Failed to ${dialogAction} request. Please try again.`
          );
          setSnackbarOpen(true);
        },
      }
    );

    setDialogOpen(false);
    setSelectedRequest(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRequest(null);
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
  if (isLoadingUser || isLoadingProfile || isLoadingRequests) {
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
        <Typography sx={{ mt: 2 }}>Loading mentor dashboard...</Typography>
      </Box>
    );
  }

  // Show error state
  if (userError || profileError || requestsError) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="error">
          Error loading mentor dashboard. Please try again later.
        </Alert>
      </Box>
    );
  }

  // Show message if user is not a mentor
  if (!mentorProfile) {
    return (
      <Box sx={{ m: 2 }}>
        <Alert severity="info">
          You don't have a mentor profile yet. Please create one to start
          mentoring.
        </Alert>
      </Box>
    );
  }

  // Filter for pending requests
  const pendingRequests =
    mentorRequests?.filter((req) => req.status === 'PENDING') || [];
  // Filter for active mentorships (accepted requests)
  const activeMentorships =
    mentorRequests?.filter((req) => req.status === 'ACCEPTED') || [];
  // Filter for past mentorships (completed or cancelled)
  const pastMentorships =
    mentorRequests?.filter(
      (req) =>
        req.status === 'COMPLETED' ||
        req.status === 'CANCELLED' ||
        req.status === 'REJECTED'
    ) || [];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Mentor Dashboard
      </Typography>

      {/* Capacity overview card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Mentorship Capacity</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body1">
                {mentorProfile.currentMenteeCount} of {mentorProfile.capacity}{' '}
                spots filled
              </Typography>
              <Chip
                label={mentorProfile.isAvailable ? 'Available' : 'Unavailable'}
                color={mentorProfile.isAvailable ? 'success' : 'error'}
                size="small"
                sx={{ ml: 2 }}
              />
            </Box>
            <Box sx={{ mt: 1, mb: 1 }}>
              <LinearProgress
                variant="determinate"
                value={capacityUsage}
                color={capacityUsage >= 100 ? 'error' : 'primary'}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
              Average Rating: {mentorProfile.averageRating.toFixed(1)}/5
              <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                (Based on {mentorProfile.reviewCount} reviews)
              </Typography>
            </Typography>
          </Box>
        </CardContent>
      </Card>

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
                    {request.mentee.username}
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
                  "{request.message}"
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => handleAcceptRequest(request)}
                    disabled={
                      mentorProfile.currentMenteeCount >= mentorProfile.capacity
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleRejectRequest(request)}
                  >
                    Decline
                  </Button>
                </Box>
                {mentorProfile.currentMenteeCount >= mentorProfile.capacity && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, display: 'block' }}
                  >
                    You've reached your mentee capacity.
                  </Typography>
                )}
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
                    {mentorship.mentee.username}
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
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      console.log(
                        'Opening chat with mentee:',
                        mentorship.channelId
                      )
                    }
                  >
                    Open Chat
                  </Button>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={() =>
                      console.log(
                        'Marking mentorship as complete:',
                        mentorship.id
                      )
                    }
                  >
                    Mark as Complete
                  </Button>
                </Box>
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
                      {mentorship.mentee.username}
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

      {/* Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          {dialogAction === 'accept'
            ? 'Accept Mentorship Request?'
            : 'Reject Mentorship Request?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogAction === 'accept'
              ? `Are you sure you want to accept the mentorship request from ${selectedRequest?.mentee.username}?
                 They will be added to your active mentorships.`
              : `Are you sure you want to reject the mentorship request from ${selectedRequest?.mentee.username}?
                 This action cannot be undone.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmAction}
            color={dialogAction === 'accept' ? 'primary' : 'error'}
            variant="contained"
            autoFocus
          >
            {dialogAction === 'accept' ? 'Accept' : 'Reject'}
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

export default Mentor;
