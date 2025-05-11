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
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
} from '@mui/icons-material';
import { Education } from '../../types/profile';
import {
  useAddEducation,
  useDeleteEducation,
  useUpdateEducation,
} from '../../services/profile.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const educationSchema = z.object({
  institution: z.string().min(1, 'Institution name is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().min(1, 'Field of study is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
  currentEducation: z.boolean().optional(),
});

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationHistoryProps {
  userId: string;
  educationHistory: Education[];
  isEditable?: boolean;
}

/**
 * Component to display and edit education history
 */
const EducationHistory: FC<EducationHistoryProps> = ({
  userId,
  educationHistory,
  isEditable = false,
}) => {
  const theme = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEducation, setCurrentEducation] = useState<Education | null>(
    null
  );

  // React Query mutations
  const addEducation = useAddEducation(userId);
  const updateEducation = useUpdateEducation(userId);
  const deleteEducation = useDeleteEducation(userId);

  // React Hook Form
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
      currentEducation: false,
    },
  });

  // Watch current education checkbox to disable end date
  const isCurrentEducation = watch('currentEducation');

  const openAddModal = () => {
    setCurrentEducation(null);
    reset({
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
      currentEducation: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (education: Education) => {
    setCurrentEducation(education);

    const isCurrentlyStudying = !education.endDate;

    reset({
      institution: education.institution,
      degree: education.degree,
      field: education.field,
      startDate: education.startDate.split('T')[0], // Format as YYYY-MM-DD
      endDate: education.endDate ? education.endDate.split('T')[0] : '', // Format as YYYY-MM-DD
      description: education.description || '',
      currentEducation: isCurrentlyStudying,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEducation(null);
    reset();
  };

  const handleDelete = async (educationId: string) => {
    if (window.confirm('Are you sure you want to delete this education?')) {
      await deleteEducation.mutateAsync(educationId);
    }
  };

  const onSubmit = async (data: EducationFormData) => {
    try {
      const formattedData = {
        ...data,
        endDate: data.currentEducation ? undefined : data.endDate,
      };

      if (currentEducation) {
        // Update existing
        await updateEducation.mutateAsync({
          ...formattedData,
          id: currentEducation.id,
          userId,
        });
      } else {
        // Add new
        await addEducation.mutateAsync({
          ...formattedData,
          userId,
        });
      }

      closeModal();
    } catch (error) {
      console.error('Error saving education:', error);
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
  if (educationHistory.length === 0 && !isEditable) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No education added yet.
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
        <Typography variant="h6">Education</Typography>

        {isEditable && (
          <Button
            startIcon={<AddIcon />}
            onClick={openAddModal}
            variant="outlined"
            size="small"
          >
            Add Education
          </Button>
        )}
      </Box>

      <Stack spacing={2}>
        {educationHistory.map((education) => (
          <Card key={education.id} variant="outlined">
            <CardContent>
              <Box display="flex" justifyContent="space-between">
                <Box>
                  <Typography variant="h6" component="div">
                    {education.degree} in {education.field}
                  </Typography>

                  <Typography color="text.secondary" gutterBottom>
                    <SchoolIcon
                      fontSize="small"
                      sx={{
                        mr: 0.5,
                        verticalAlign: 'middle',
                        fontSize: '1rem',
                      }}
                    />
                    {education.institution}
                  </Typography>

                  <Box mt={1}>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(education.startDate)} -{' '}
                      {formatDate(education.endDate)}
                      {' · '}
                      <span>
                        {calculateDuration(
                          education.startDate,
                          education.endDate
                        )}
                      </span>
                    </Typography>
                  </Box>

                  {education.description && (
                    <Typography variant="body2" mt={1}>
                      {education.description}
                    </Typography>
                  )}
                </Box>

                {isEditable && (
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => openEditModal(education)}
                      aria-label="Edit"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => handleDelete(education.id)}
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

        {educationHistory.length === 0 && isEditable && (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              No education added yet
            </Typography>
            <Button startIcon={<AddIcon />} onClick={openAddModal} size="small">
              Add Your First Education
            </Button>
          </Paper>
        )}
      </Stack>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onClose={closeModal} fullWidth maxWidth="sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>
            {currentEducation ? 'Edit Education' : 'Add Education'}
          </DialogTitle>

          <DialogContent dividers>
            <Stack spacing={2}>
              <Controller
                name="institution"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Institution"
                    fullWidth
                    error={!!errors.institution}
                    helperText={errors.institution?.message}
                    required
                  />
                )}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Controller
                  name="degree"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Degree"
                      fullWidth
                      error={!!errors.degree}
                      helperText={errors.degree?.message}
                      required
                    />
                  )}
                />

                <Controller
                  name="field"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Field of Study"
                      fullWidth
                      error={!!errors.field}
                      helperText={errors.field?.message}
                      required
                    />
                  )}
                />
              </Stack>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.startDate}
                      helperText={errors.startDate?.message}
                    />
                  )}
                />

                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="End Date"
                      type="date"
                      fullWidth
                      disabled={isCurrentEducation}
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.endDate}
                      helperText={errors.endDate?.message}
                    />
                  )}
                />
              </Stack>

              <FormControlLabel
                control={
                  <Controller
                    name="currentEducation"
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
                label="I am currently studying here"
              />

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
            </Stack>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {currentEducation ? 'Update' : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EducationHistory;
