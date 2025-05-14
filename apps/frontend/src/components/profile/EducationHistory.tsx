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
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import School from '@mui/icons-material/School';
import { Education } from '../../types/profile';
import {
  useAddEducation,
  useDeleteEducation,
  useUpdateEducation,
} from '../../services/profile.service';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const educationSchema = z
  .object({
    school: z.string().min(1, 'Institution name is required'),
    degree: z.string().min(1, 'Degree is required'),
    field: z.string().min(1, 'Field of study is required'),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().optional(),
    currentEducation: z.boolean(),
  })
  .refine(
    (data) =>
      data.currentEducation || (!!data.endDate && data.endDate.length > 0),
    {
      message: 'End date is required if you are not currently studying here',
      path: ['endDate'],
    }
  );

type EducationFormData = z.infer<typeof educationSchema>;

interface EducationHistoryProps {
  userId: number;
  educationHistory: Education[];
  isEditable?: boolean;
}

/**
 * Component to display and edit education history
 */
const EducationHistory: FC<EducationHistoryProps> = ({
  userId,
  educationHistory,
  isEditable,
}) => {
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
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      currentEducation: false,
    },
  });

  const openAddModal = () => {
    setCurrentEducation(null);
    reset({
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      currentEducation: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (education: Education) => {
    setCurrentEducation(education);

    reset({
      school: education.school,
      degree: education.degree,
      field: education.field,
      startDate: education.startDate.split('T')[0], // Format as YYYY-MM-DD
      endDate: education.endDate ? education.endDate.split('T')[0] : '', // Format as YYYY-MM-DD
      currentEducation: !education.endDate,
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentEducation(null);
    reset();
  };

  const handleDelete = async (educationId: number) => {
    if (window.confirm('Are you sure you want to delete this education?')) {
      await deleteEducation.mutateAsync(educationId);
    }
  };

  const onSubmit = async (data: EducationFormData) => {
    try {
      if (currentEducation) {
        // Update existing
        await updateEducation.mutateAsync({
          ...data,
          id: currentEducation.id,
        });
      } else {
        // Add new
        await addEducation.mutateAsync({
          ...data,
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
        <Typography variant="h5" gutterBottom>
          Education
        </Typography>
        {isEditable && educationHistory.length > 0 && (
          <Button
            startIcon={<Add />}
            onClick={openAddModal}
            variant="outlined"
            size="small"
          >
            Add Education
          </Button>
        )}
      </Box>
      <Divider sx={{ my: 2 }} />
      <Box>
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
                      <School
                        fontSize="small"
                        sx={{
                          mr: 0.5,
                          verticalAlign: 'middle',
                          fontSize: '1rem',
                        }}
                      />
                      {education.school}
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
                  </Box>

                  {isEditable && (
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => openEditModal(education)}
                        aria-label="Edit"
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={() => handleDelete(education.id)}
                        aria-label="Delete"
                        color="error"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          ))}

          {educationHistory.length === 0 && (
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No education added yet
              </Typography>
              {isEditable && (
                <Button startIcon={<Add />} onClick={openAddModal} size="small">
                  Add Your First Education
                </Button>
              )}
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
                  name="school"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Institution"
                      fullWidth
                      error={!!errors.school}
                      helperText={errors.school?.message}
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

                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="End Date"
                        type="date"
                        fullWidth
                        disabled={watch('currentEducation')}
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
    </Box>
  );
};

export default EducationHistory;
