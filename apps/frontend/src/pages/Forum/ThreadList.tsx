// src/pages/Forum/ThreadList.tsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Alert,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Pagination,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import AddIcon from '@mui/icons-material/Add';
import {
  useGetThreads,
  useCreateThread,
  useGetThreadTags,
} from '../../services/threads.service';
import { Thread } from '../../types/thread';
import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../services/user.service';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { useDeleteThread } from '../../services/threads.service';
import { User } from '../../types/auth';
import { useEffect } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReportIcon from '@mui/icons-material/Report';
import {
  useReportThread,
  useLikeThread,
  useUnlikeThread,
  useGetThreadLikers,
} from '../../services/threads.service';
import Tooltip from '@mui/material/Tooltip';

// Create Thread Dialog component
const CreateThreadDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onThreadCreated: () => void;
}> = ({ open, onClose, onThreadCreated }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: availableTags } = useGetThreadTags();
  const createThread = useCreateThread();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !body.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      await createThread.mutateAsync({
        title,
        body,
        tags: tags.length > 0 ? tags : ['General'], // Default tag if none selected
      });

      // Reset form
      setTitle('');
      setBody('');
      setTags([]);
      setCustomTag('');
      setError(null);

      // Close dialog and refresh thread list
      onClose();
      onThreadCreated();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : 'Failed to create thread'
      );
    }
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag('');
    }
  };

  const handleTagToggle = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Thread</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          autoFocus
          margin="dense"
          label="Thread Title"
          fullWidth
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Thread Content"
          multiline
          rows={6}
          fullWidth
          value={body}
          onChange={(e) => setBody(e.target.value)}
          sx={{ mb: 3 }}
        />

        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Tags
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {availableTags?.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.name}
              onClick={() => handleTagToggle(tag.name)}
              color={tags.includes(tag.name) ? 'primary' : 'default'}
              clickable
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            label="Add Custom Tag"
            size="small"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
          />
          <Button
            variant="outlined"
            onClick={handleAddCustomTag}
            disabled={!customTag.trim()}
          >
            Add
          </Button>
        </Box>

        {tags.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Selected Tags:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => handleTagToggle(tag)}
                  color="primary"
                />
              ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={createThread.isPending || !title.trim() || !body.trim()}
        >
          {createThread.isPending ? 'Creating...' : 'Create Thread'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Simple ThreadCard component (unchanged)
const ThreadCard: React.FC<{
  thread: Thread;
  currentUser: User | null;
  onDeleteThread: (threadId: number) => void;
}> = ({ thread, currentUser, onDeleteThread }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get hooks for like, unlike, and report
  const likeThread = useLikeThread();
  const unlikeThread = useUnlikeThread();
  const reportThread = useReportThread();

  // Get likers for this thread
  const { data: likers = [] } = useGetThreadLikers(thread.id);

  // Check if current user has liked this thread
  const hasLiked = currentUser
    ? likers.some((liker) => liker.id === currentUser.id)
    : false;

  const handleThreadClick = () => {
    navigate(`/forum/${thread.id}`);
  };

  const isOwnThread =
    currentUser?.id !== undefined && // make sure we actually have an id
    Number(currentUser.id) === thread.creatorId;

  // Handle like/unlike
  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      if (hasLiked) {
        await unlikeThread.mutateAsync(thread.id);
      } else {
        await likeThread.mutateAsync(thread.id);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle report
  const handleReport = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
        await reportThread.mutateAsync(thread.id);
        alert('Thread reported successfully.');
      } catch (error) {
        console.error('Failed to report thread:', error);
        alert('Failed to report thread. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <CardActionArea onClick={handleThreadClick} sx={{ flexGrow: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <Typography variant="h6">{thread.title}</Typography>
              {thread.reported && (
                <Chip
                  icon={<FlagIcon />}
                  label="Reported"
                  color="warning"
                  size="small"
                />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              Posted by: User #{thread.creatorId}
            </Typography>
            <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
              {thread.body.substring(0, 150)}
              {thread.body.length > 150 ? '...' : ''}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {thread.tags.map((tag, index) => (
                <Chip key={index} label={tag} size="small" />
              ))}
            </Box>
          </CardContent>
        </CardActionArea>

        {/* Action buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            p: 1,
            justifyContent: 'space-between',
          }}
        >
          {/* Like button */}
          <Tooltip title={hasLiked ? 'Unlike' : 'Like'}>
            <IconButton
              color={hasLiked ? 'primary' : 'default'}
              onClick={handleLikeToggle}
              disabled={isSubmitting}
              size="small"
              aria-label={hasLiked ? 'unlike thread' : 'like thread'}
            >
              {hasLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>

          {/* Like count */}
          <Typography variant="caption" align="center" sx={{ mb: 2 }}>
            {likers.length}
          </Typography>

          {/* Report button */}
          {!isOwnThread && !thread.reported && (
            <Tooltip title="Report">
              <IconButton
                color="default"
                onClick={handleReport}
                disabled={isSubmitting}
                size="small"
                aria-label="report thread"
              >
                <ReportIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Delete button for own threads */}
          {isOwnThread && (
            <Tooltip title="Delete">
              <IconButton
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteThread(thread.id);
                }}
                disabled={isSubmitting}
                size="small"
                aria-label="delete thread"
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Card>
  );
};

const ThreadListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const threadsPerPage = 10;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [successSnackbarOpen, setSuccessSnackbarOpen] = useState(false);
  const [deleteSuccessSnackbarOpen, setDeleteSuccessSnackbarOpen] =
    useState(false);
  const [_deletingThreadId, setDeletingThreadId] = useState<number | null>(null);

  const [likeSnackbarOpen, setLikeSnackbarOpen] = useState(false);
  const [likeSnackbarMessage, _setLikeSnackbarMessage] = useState('');
  const [reportSnackbarOpen, setReportSnackbarOpen] = useState(false);

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

  // Delete thread mutation
  const deleteThread = useDeleteThread();

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
              onDeleteThread={handleDeleteThread}
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
