import { FC, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { Experience } from '../../types/profile';
import {
  useAddWorkExperience,
  useDeleteWorkExperience,
  useUpdateWorkExperience,
} from '../../services/profile.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const workExperienceSchema = z.object({
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  currentJob: z.boolean().optional(),
});

type WorkExperienceFormData = z.infer<typeof workExperienceSchema>;

interface WorkHistoryProps {
  userId: number;
  workHistory: Experience[];
  isEditable?: boolean;
}

/**
 * Component to display and edit work history
 */
const WorkHistory: FC<WorkHistoryProps> = ({
  userId,
  workHistory,
  isEditable,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(
    null
  );

  // React Query mutations
  const addWorkExperience = useAddWorkExperience(userId);
  const updateWorkExperience = useUpdateWorkExperience(userId);
  const deleteWorkExperience = useDeleteWorkExperience(userId);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<WorkExperienceFormData>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
    },
  });

  const openAddModal = () => {
    setCurrentExperience(null);
    reset({
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (experience: Experience) => {
    setCurrentExperience(experience);

    const isCurrentPosition = !experience.endDate;

    reset({
      company: experience.company,
      position: experience.position,
      description: experience.description || '',
      startDate: experience.startDate.split('T')[0], // Format as YYYY-MM-DD
      endDate: experience.endDate ? experience.endDate.split('T')[0] : '', // Format as YYYY-MM-DD
      currentJob: isCurrentPosition,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentExperience(null);
    reset();
  };

  const handleDelete = async (experienceId: number) => {
    if (
      window.confirm('Are you sure you want to delete this work experience?')
    ) {
      await deleteWorkExperience.mutateAsync(experienceId);
    }
  };

  const onSubmit = async (data: WorkExperienceFormData) => {
    try {
      const formattedData = {
        ...data,
        endDate: data.currentJob ? undefined : data.endDate,
      };

      if (currentExperience) {
        // Update existing
        await updateWorkExperience.mutateAsync({
          ...formattedData,
          id: currentExperience.id,
        });
      } else {
        // Add new
        await addWorkExperience.mutateAsync({
          ...formattedData,
        });
      }

      closeModal();
    } catch (error) {
      console.error('Error saving work experience:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const calculateDuration = (startDate: string, endDate?: string) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();

    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    let durationText = '';

    if (years > 0) {
      durationText += `${years} ${years === 1 ? 'year' : 'years'}`;
    }

    if (months > 0 || years === 0) {
      if (durationText) durationText += ', ';
      durationText += `${months} ${months === 1 ? 'month' : 'months'}`;
    }

    return durationText;
  };

  // Empty state
  if (workHistory.length === 0 && !isEditable) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No work experience added yet.
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
        <Typography variant="h5" gutterBottom>
          Work Experience
        </Typography>
        {isEditable && workHistory.length > 0 && (
          <Button
            startIcon={<AddIcon />}
            onClick={openAddModal}
            variant="outlined"
            size="small"
          >
            Add Experience
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box>
        {workHistory.length > 0 ? (
          <Stack spacing={2}>
            {workHistory.map((experience) => (
              <Card key={experience.id} variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between">
                    <Box>
                      <Typography variant="h6" component="div">
                        {experience.position}
                      </Typography>

                      <Typography color="text.secondary" gutterBottom>
                        <BusinessIcon
                          fontSize="small"
                          sx={{
                            mr: 0.5,
                            verticalAlign: 'middle',
                            fontSize: '1rem',
                          }}
                        />
                        {experience.company}
                      </Typography>

                      <Box mt={1}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(experience.startDate)} -{' '}
                          {formatDate(experience.endDate)}
                          {' · '}
                          <span>
                            {calculateDuration(
                              experience.startDate,
                              experience.endDate
                            )}
                          </span>
                        </Typography>
                      </Box>

                      {experience.description && (
                        <Typography variant="body2" mt={1}>
                          {experience.description}
                        </Typography>
                      )}
                    </Box>

                    {isEditable && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => openEditModal(experience)}
                          aria-label="Edit"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          onClick={() => handleDelete(experience.id)}
                          aria-label="Delete"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Paper
            sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No work experience added yet
            </Typography>
            {isEditable && (
              <Button
                startIcon={<AddIcon />}
                onClick={openAddModal}
                size="small"
              >
                Add Your First Experience
              </Button>
            )}
          </Paper>
        )}

        {/* Add/Edit Modal */}
        <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogTitle>
              {currentExperience
                ? 'Edit Work Experience'
                : 'Add Work Experience'}
            </DialogTitle>

            <DialogContent dividers>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="company"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Company"
                        fullWidth
                        error={!!errors.company}
                        helperText={errors.company?.message}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Job Title"
                        fullWidth
                        error={!!errors.position}
                        helperText={errors.position?.message}
                        required
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Start Date"
                        type="date"
                        fullWidth
                        required
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                        }}
                        error={!!errors.startDate}
                        helperText={errors.startDate?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="End Date"
                        type="date"
                        fullWidth
                        disabled={watch('currentJob')}
                        slotProps={{
                          inputLabel: {
                            shrink: true,
                          },
                        }}
                        error={!!errors.endDate}
                        helperText={errors.endDate?.message}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Controller
                        name="currentJob"
                        control={control}
                        render={({ field: { value, onChange, ...field } }) => (
                          <Checkbox
                            {...field}
                            checked={value}
                            onChange={(e) => {
                              onChange(e);
                              if (e.target.checked) {
                                setValue('endDate', '');
                              }
                            }}
                          />
                        )}
                      />
                    }
                    label="I currently work here"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions>
              <Button onClick={closeModal}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={isSubmitting}>
                {currentExperience ? 'Update' : 'Add'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Box>
  );
};

export default WorkHistory;
