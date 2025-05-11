import { FC, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Interest } from '../../types/profile';
import { useUpdateInterests } from '../../services/profile.service';

interface InterestsSectionProps {
  userId: string;
  interests: Interest[];
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
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInterestName, setNewInterestName] = useState('');
  const [newInterestCategory, setNewInterestCategory] = useState('');
  const [interestsState, setInterestsState] = useState<Interest[]>(interests);

  // React Query mutation
  const updateInterests = useUpdateInterests(userId);

  // Open the add interest modal
  const openAddModal = () => {
    setNewInterestName('');
    setNewInterestCategory('');
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add a new interest
  const handleAddInterest = () => {
    if (!newInterestName.trim()) return;

    const newInterest: Interest = {
      id: `temp-${Date.now()}`, // Temporary ID, will be replaced by backend
      name: newInterestName.trim(),
      category: newInterestCategory.trim() || undefined,
    };

    const updatedInterests = [...interestsState, newInterest];
    setInterestsState(updatedInterests);
    updateInterests.mutate(updatedInterests);
    closeModal();
  };

  // Remove an interest
  const handleRemoveInterest = (interestId: string) => {
    const updatedInterests = interestsState.filter(
      (interest) => interest.id !== interestId
    );
    setInterestsState(updatedInterests);
    updateInterests.mutate(updatedInterests);
  };

  // Group interests by category
  const groupedInterests = interestsState.reduce<Record<string, Interest[]>>(
    (acc, interest) => {
      const category = interest.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(interest);
      return acc;
    },
    {}
  );

  // Empty state
  if (interestsState.length === 0 && !isEditable) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No interests added yet.
        </Typography>
      </Paper>
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
        <Typography variant="h6">Interests</Typography>

        {isEditable && (
          <Button
            startIcon={<AddIcon />}
            onClick={openAddModal}
            variant="outlined"
            size="small"
          >
            Add Interest
          </Button>
        )}
      </Box>

      {Object.keys(groupedInterests).length > 0 ? (
        <Box>
          {Object.entries(groupedInterests).map(
            ([category, categoryInterests]) => (
              <Box key={category} mb={2}>
                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                  {category}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  {categoryInterests.map((interest) => (
                    <Chip
                      key={interest.id}
                      label={interest.name}
                      variant="outlined"
                      onDelete={
                        isEditable
                          ? () => handleRemoveInterest(interest.id)
                          : undefined
                      }
                      deleteIcon={isEditable ? <DeleteIcon /> : undefined}
                    />
                  ))}
                </Stack>
              </Box>
            )
          )}
        </Box>
      ) : (
        isEditable && (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No interests added yet
            </Typography>
            <Button startIcon={<AddIcon />} onClick={openAddModal} size="small">
              Add Your First Interest
            </Button>
          </Paper>
        )
      )}

      {/* Add Interest Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="xs">
        <DialogTitle>Add Interest</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="Interest Name"
              fullWidth
              value={newInterestName}
              onChange={(e) => setNewInterestName(e.target.value)}
              placeholder="e.g., Photography, AI, Cooking"
              required
            />

            <TextField
              label="Category (Optional)"
              fullWidth
              value={newInterestCategory}
              onChange={(e) => setNewInterestCategory(e.target.value)}
              placeholder="e.g., Technology, Arts, Sports"
            />
          </Stack>
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
