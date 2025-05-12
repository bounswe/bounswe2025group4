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
import { useUpdateSkills } from '../../services/profile.service';

interface SkillsSectionProps {
  userId: number;
  skills: string[];
  isEditable?: boolean;
}

/**
 * Component to display and edit user skills
 */
const SkillsSection: FC<SkillsSectionProps> = ({
  userId,
  skills,
  isEditable = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');

  const [skillsState, setSkillsState] = useState<string[]>(skills);

  // React Query mutation
  const updateSkills = useUpdateSkills(userId);

  // Open the add modal
  const openAddModal = () => {
    setNewSkillName('');
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add a new skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const updatedSkills = [...skillsState, newSkillName.trim()];
    setSkillsState(updatedSkills);
    updateSkills.mutate(updatedSkills);
    closeModal();
  };

  // Remove a skill
  const handleRemoveSkill = (skill: string) => {
    const updatedSkills = skillsState.filter((s) => s !== skill);
    setSkillsState(updatedSkills);
    updateSkills.mutate(updatedSkills);
  };

  // Empty state
  if (skillsState.length === 0 && !isEditable) {
    return (
      <Box sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No skills added yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" gutterBottom>
            Skills
          </Typography>

          {isEditable && skillsState.length > 0 && (
            <Button
              startIcon={<Add />}
              onClick={openAddModal}
              variant="outlined"
              size="small"
            >
              Add Skill
            </Button>
          )}
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box>
          {skillsState.length > 0 ? (
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {skillsState.map((skill) => (
                  <Chip
                    key={skill}
                    label={skill}
                    variant="outlined"
                    onDelete={
                      isEditable ? () => handleRemoveSkill(skill) : undefined
                    }
                    deleteIcon={isEditable ? <Delete /> : undefined}
                  />
                ))}
              </Stack>
            </Box>
          ) : (
            isEditable && (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  No skills added yet
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={openAddModal}
                  size="small"
                >
                  Add Your First Skill
                </Button>
              </Box>
            )
          )}

          {/* Add Skill Modal */}
          <Dialog
            open={isModalOpen}
            onClose={closeModal}
            fullWidth
            maxWidth="xs"
          >
            <DialogTitle>Add Skill</DialogTitle>

            <DialogContent dividers>
              <Stack spacing={2}>
                <TextField
                  label="Skill Name"
                  fullWidth
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g., JavaScript, Project Management, SEO"
                />
              </Stack>
            </DialogContent>

            <DialogActions>
              <Button onClick={closeModal}>Cancel</Button>
              <Button
                onClick={handleAddSkill}
                variant="contained"
                disabled={!newSkillName.trim()}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
};

export default SkillsSection;
