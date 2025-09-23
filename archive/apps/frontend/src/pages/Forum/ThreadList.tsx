import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Pagination,
  Button,
  Snackbar,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { User } from '../../types/auth';
import {
  useGetThreads,
  useDeleteThread,
  useReportThread,
  useLikeThread,
  useUnlikeThread,
} from '../../services/threads.service';
import { useCurrentUser } from '../../services/user.service';
import CreateThreadDialog from '../../components/forum/ThreadDialog';
import ThreadCard from '../../components/forum/ThreadCard';

const ThreadListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 10;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [deleteSuccessSnackbarOpen, setDeleteSuccessSnackbarOpen] =
    useState(false);
  const [_deletingThreadId, setDeletingThreadId] = useState<number | null>(
    null
  );

  const [likeSnackbarOpen, setLikeSnackbarOpen] = useState(false);
  const [likeSnackbarMessage, _setLikeSnackbarMessage] = useState('');
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  // Get current user using the same approach as in your comments section
  const currentUser = useCurrentUser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser.data) {
      setUser(currentUser.data);
    }
  }, [currentUser.data]);

  // Fetch threads using our hook
  const { data: threads, isLoading, isError, error, refetch } = useGetThreads();

  // Thread mutations
  const deleteThread = useDeleteThread();
  const likeThread = useLikeThread();
  const unlikeThread = useUnlikeThread();
  const reportThread = useReportThread();

  // Pagination logic
  const totalThreads = threads?.length || 0;
  const totalPages = Math.ceil(totalThreads / threadsPerPage);
  const currentThreads = threads
    ? threads.slice(
        (currentPage - 1) * threadsPerPage,
        currentPage * threadsPerPage
      )
    : [];

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  const handleCreateThreadClick = () => {
    setCreateDialogOpen(true);
  };

  const handleDialogClose = () => {
    setCreateDialogOpen(false);
  };

  const handleThreadCreated = () => {
    refetch();
    setSuccessSnackbarOpen(true);
    setCurrentPage(1); // Go to first page to see the new thread
  };

  const handleDeleteThread = async (threadId: number) => {
    if (window.confirm('Are you sure you want to delete this thread?')) {
      setDeletingThreadId(threadId);
      try {
        await deleteThread.mutateAsync(threadId);
        refetch();
        setDeleteSuccessSnackbarOpen(true);
      } catch (error) {
        console.error('Failed to delete thread:', error);
      } finally {
        setDeletingThreadId(null);
      }
    }
  };

  // Handle like/unlike
  const handleLikeToggle = async (threadId: number, hasLiked: boolean) => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      if (hasLiked) {
        await unlikeThread.mutateAsync(threadId);
      } else {
        await likeThread.mutateAsync(threadId);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle report
  const handleReport = async (threadId: number) => {
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }

    if (
      window.confirm(
        'Are you sure you want to report this thread as inappropriate?'
      )
    ) {
      setIsSubmitting(true);
      try {
        await reportThread.mutateAsync(threadId);
        setReportSnackbarOpen(true);
        refetch();
      } catch (error) {
        console.error('Failed to report thread:', error);
        alert('Failed to report thread. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Forum Threads</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateThreadClick}
        >
          New Thread
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Error fetching threads:{' '}
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Alert>
      )}

      {isLoading ? (
        <Typography>Loading threads...</Typography>
      ) : totalThreads > 0 ? (
        <>
          {currentThreads.map((thread) => (
            <ThreadCard
              key={thread.id}
              thread={thread}
              currentUser={user}
              onLikeToggle={handleLikeToggle}
              onDeleteThread={handleDeleteThread}
              onReportThread={handleReport}
              isSubmitting={isSubmitting}
            />
          ))}

          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
            />
          )}
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" gutterBottom>
            No threads yet
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateThreadClick}
            sx={{ mt: 2 }}
          >
            Create First Thread
          </Button>
        </Box>
      )}

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        open={createDialogOpen}
        onClose={handleDialogClose}
        onThreadCreated={handleThreadCreated}
      />

      {/* Success Snackbars */}
      <Snackbar
        open={successSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSuccessSnackbarOpen(false)}
        message="Thread created successfully"
      />

      <Snackbar
        open={deleteSuccessSnackbarOpen}
        autoHideDuration={5000}
        onClose={() => setDeleteSuccessSnackbarOpen(false)}
        message="Thread deleted successfully"
      />

      <Snackbar
        open={likeSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setLikeSnackbarOpen(false)}
        message={likeSnackbarMessage}
      />

      <Snackbar
        open={reportSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setReportSnackbarOpen(false)}
        message="Thread reported successfully"
      />
    </Container>
  );
};

export default ThreadListPage;
