import { FC, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import { useUpdateInterests } from '../../services/profile.service';

interface InterestsSectionProps {
  userId: number;
  interests: string[];
  isEditable?: boolean;
}

/**
 * Component to display and edit user interests
 */
const InterestsSection: FC<InterestsSectionProps> = ({
  userId,
  interests,
  isEditable = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInterestName, setNewInterestName] = useState('');
  const [interestsState, setInterestsState] = useState<string[]>(interests);

  // React Query mutation
  const updateInterests = useUpdateInterests(userId);

  // Open the add interest modal
  const openAddModal = () => {
    setNewInterestName('');
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add a new interest
  const handleAddInterest = () => {
    if (!newInterestName.trim()) return;

    const updatedInterests = [...interestsState, newInterestName];
    setInterestsState(updatedInterests);
    updateInterests.mutate(updatedInterests);
    closeModal();
  };

  // Remove an interest
  const handleRemoveInterest = (interest: string) => {
    const updatedInterests = interestsState.filter((i) => i !== interest);
    setInterestsState(updatedInterests);
    updateInterests.mutate(updatedInterests);
  };

  // Empty state
  if (interestsState.length === 0 && !isEditable) {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No interests added yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Interests</Typography>

        {isEditable && interestsState.length > 0 && (
          <Button
            startIcon={<Add />}
            onClick={openAddModal}
            variant="outlined"
            size="small"
          >
            Add Interest
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      {interestsState.length > 0 ? (
        <Box>
          {interestsState.map((interest) => (
            <Box key={interest} mb={2}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                <Chip
                  key={interest}
                  label={interest}
                  variant="outlined"
                  onDelete={
                    isEditable
                      ? () => handleRemoveInterest(interest)
                      : undefined
                  }
                  deleteIcon={isEditable ? <Delete /> : undefined}
                />
              </Stack>
            </Box>
          ))}
        </Box>
      ) : (
        isEditable && (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No interests added yet
            </Typography>
            <Button startIcon={<Add />} onClick={openAddModal} size="small">
              Add Your First Interest
            </Button>
          </Box>
        )
      )}

      {/* Add Interest Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="xs">
        <DialogTitle>Add Interest</DialogTitle>

        <DialogContent dividers>
          <TextField
            label="Interest Name"
            fullWidth
            value={newInterestName}
            onChange={(e) => setNewInterestName(e.target.value)}
            placeholder="e.g., Photography, AI, Cooking"
            required
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button
            onClick={handleAddInterest}
            variant="contained"
            disabled={!newInterestName.trim()}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InterestsSection;
