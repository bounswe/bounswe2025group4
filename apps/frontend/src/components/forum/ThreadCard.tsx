import { User } from '../../types/auth';
import { Thread } from '../../types/thread';
import { useNavigate } from 'react-router-dom';
import { useGetThreadLikers } from '../../services/threads.service';
import {
  Card,
  Box,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ReportIcon from '@mui/icons-material/Report';
import DeleteIcon from '@mui/icons-material/Delete';
import FlagIcon from '@mui/icons-material/Flag';

const ThreadCard: React.FC<{
  thread: Thread;
  currentUser: User | null;
  isSubmitting: boolean;
  onLikeToggle: (threadId: number, hasLiked: boolean) => void;
  onDeleteThread: (threadId: number) => void;
  onReportThread: (threadId: number) => void;
}> = ({
  thread,
  currentUser,
  isSubmitting,
  onLikeToggle,
  onDeleteThread,
  onReportThread,
}) => {
  const navigate = useNavigate();

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
              onClick={() => onLikeToggle(thread.id, hasLiked)}
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
                onClick={() => onReportThread(thread.id)}
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

export default ThreadCard;
