// src/pages/Forum/ThreadDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Alert,
  Card,
  CardContent,
  Chip,
  Divider,
  CircularProgress,
  Paper,
  TextField,
  Button,
  Snackbar,
  IconButton,
} from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  useGetThreadComments,
  useCreateComment,
  useGetThreadById,
  useDeleteComment,
} from '../../services/threads.service';
import { useCurrentUser } from '../../services/auth.service';
import { User } from '../../types/user';

// CommentForm component for adding new comments
const CommentForm: React.FC<{
  threadId: number;
  onCommentAdded: () => void;
}> = ({ threadId, onCommentAdded }) => {
  const [commentText, setCommentText] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);

  const createComment = useCreateComment();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!commentText.trim()) {
      return;
    }

    try {
      await createComment.mutateAsync({
        threadId,
        data: { body: commentText },
      });

      setCommentText('');
      setSubmitError(null);
      setIsSnackbarOpen(true);
      onCommentAdded();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to post comment'
      );
    }
  };

  const handleCloseSnackbar = () => {
    setIsSnackbarOpen(false);
  };

  return (
    <>
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add a Comment
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Write your comment here..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
          />

          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              endIcon={<SendIcon />}
              disabled={createComment.isPending || !commentText.trim()}
            >
              {createComment.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={isSnackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message="Comment posted successfully"
      />
    </>
  );
};

const ThreadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const threadId = parseInt(id || '0', 10);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null
  );
  const [deleteSnackbarOpen, setDeleteSnackbarOpen] = useState(false);
  const deleteComment = useDeleteComment();
  const currentUser = useCurrentUser();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser.data) {
      setUser(currentUser.data);
    }
  }, [currentUser.data]);

  const {
    data: thread,
    isLoading: isThreadLoading,
    isError: isThreadError,
  } = useGetThreadById(threadId);
  const {
    data: comments,
    isLoading: isCommentsLoading,
    isError: isCommentsError,
    refetch: refetchComments,
  } = useGetThreadComments(threadId);

  // Function to handle when a new comment is added
  const handleCommentAdded = () => {
    refetchComments();
  };

  const handleDeleteComment = async (commentId: number) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setDeletingCommentId(commentId);
      try {
        await deleteComment.mutateAsync({
          commentId,
          threadId,
        });
        setDeleteSnackbarOpen(true);
        refetchComments();
      } catch (error) {
        console.error('Failed to delete comment:', error);
        // You could show an error message here
      } finally {
        setDeletingCommentId(null);
      }
    }
  };

  if (isThreadLoading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (isThreadError || !thread) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Thread not found or error loading thread</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 2,
          }}
        >
          <Typography variant="h4">{thread.title}</Typography>
          {thread.reported && (
            <Chip icon={<FlagIcon />} label="Reported" color="warning" />
          )}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Posted by: User #{thread.creatorId}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {thread.tags.map((tag, index) => (
            <Chip key={index} label={tag} />
          ))}
        </Box>

        <Typography variant="body1" sx={{ mt: 3, mb: 3 }}>
          {thread.body}
        </Typography>
      </Paper>

      {/* Add the comment form */}
      <CommentForm threadId={threadId} onCommentAdded={handleCommentAdded} />

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
        Comments
      </Typography>

      <Divider sx={{ mb: 3 }} />

      {isCommentsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      ) : isCommentsError ? (
        <Alert severity="error">Error loading comments</Alert>
      ) : comments && comments.length > 0 ? (
        comments.map((comment) => (
          <Card key={comment.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {comment.author.username}
                </Typography>
                {comment.reported && (
                  <Chip
                    icon={<FlagIcon />}
                    label="Reported"
                    color="warning"
                    size="small"
                  />
                )}
                {comment.author.id === user?.id && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={
                      deleteComment.isPending &&
                      deletingCommentId === comment.id
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {comment.body}
              </Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
          No comments yet
        </Typography>
      )}
      <Snackbar
        open={deleteSnackbarOpen}
        autoHideDuration={3000}
        onClose={() => setDeleteSnackbarOpen(false)}
        message="Comment deleted successfully"
      />
    </Container>
  );
};

export default ThreadDetailPage;
