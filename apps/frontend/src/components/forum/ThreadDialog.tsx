import { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
} from '@mui/material';
import {
  useCreateThread,
  useGetThreadTags,
} from '../../services/threads.service';

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
              key={availableTags.indexOf(tag)}
              label={tag}
              onClick={() => handleTagToggle(tag)}
              color={tags.includes(tag) ? 'primary' : 'default'}
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

export default CreateThreadDialog;
