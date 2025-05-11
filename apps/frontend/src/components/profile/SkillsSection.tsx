import { FC, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  ChipProps,
  SelectChangeEvent,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { Skill } from '../../types/profile';
import { useUpdateSkills } from '../../services/profile.service';

interface SkillsSectionProps {
  userId: string;
  skills: Skill[];
  isEditable?: boolean;
}

const skillLevels = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
  { value: 'EXPERT', label: 'Expert' },
];

type SkillLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';

/**
 * Component to display and edit user skills
 */
const SkillsSection: FC<SkillsSectionProps> = ({
  userId,
  skills,
  isEditable = false,
}) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] =
    useState<SkillLevel>('INTERMEDIATE');
  const [skillsState, setSkillsState] = useState<Skill[]>(skills);

  // React Query mutation
  const updateSkills = useUpdateSkills(userId);

  // Open the add skill modal
  const openAddModal = () => {
    setNewSkillName('');
    setNewSkillLevel('INTERMEDIATE');
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Add a new skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    const newSkill: Skill = {
      id: `temp-${Date.now()}`, // Temporary ID, will be replaced by backend
      name: newSkillName.trim(),
      level: newSkillLevel,
    };

    const updatedSkills = [...skillsState, newSkill];
    setSkillsState(updatedSkills);
    updateSkills.mutate(updatedSkills);
    closeModal();
  };

  // Remove a skill
  const handleRemoveSkill = (skillId: string) => {
    const updatedSkills = skillsState.filter((skill) => skill.id !== skillId);
    setSkillsState(updatedSkills);
    updateSkills.mutate(updatedSkills);
  };

  // Get color based on skill level
  const getSkillColor = (level: SkillLevel): ChipProps['color'] => {
    switch (level) {
      case 'BEGINNER':
        return 'info';
      case 'INTERMEDIATE':
        return 'success';
      case 'ADVANCED':
        return 'primary';
      case 'EXPERT':
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Handle select change
  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    setNewSkillLevel(event.target.value as SkillLevel);
  };

  // Empty state
  if (skillsState.length === 0 && !isEditable) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No skills added yet.
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
        <Typography variant="h6">Skills</Typography>

        {isEditable && (
          <Button
            startIcon={<AddIcon />}
            onClick={openAddModal}
            variant="outlined"
            size="small"
          >
            Add Skill
          </Button>
        )}
      </Box>

      {skillsState.length > 0 ? (
        <Box sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {skillsState.map((skill) => (
              <Chip
                key={skill.id}
                label={skill.name}
                color={getSkillColor(skill.level as SkillLevel)}
                variant="outlined"
                onDelete={
                  isEditable ? () => handleRemoveSkill(skill.id) : undefined
                }
                deleteIcon={isEditable ? <DeleteIcon /> : undefined}
              />
            ))}
          </Stack>
        </Box>
      ) : (
        isEditable && (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No skills added yet
            </Typography>
            <Button startIcon={<AddIcon />} onClick={openAddModal} size="small">
              Add Your First Skill
            </Button>
          </Paper>
        )
      )}

      {/* Add Skill Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="xs">
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

            <FormControl fullWidth>
              <InputLabel id="skill-level-label">Skill Level</InputLabel>
              <Select
                labelId="skill-level-label"
                value={newSkillLevel}
                label="Skill Level"
                onChange={handleSelectChange}
              >
                {skillLevels.map((level) => (
                  <MenuItem key={level.value} value={level.value}>
                    {level.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
  );
};

export default SkillsSection;
