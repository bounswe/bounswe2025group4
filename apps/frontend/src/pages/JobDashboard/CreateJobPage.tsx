import React from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useCreateJob } from '../../services/jobs.service';
import { JobPost } from '../../types/job';

// Zod schema for validation (as per roadmap)
const jobPostSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters long'),
    companyName: z.string().min(2, 'Company name is required'),
    location: z.string().min(2, 'Location is required'),
    isRemote: z.boolean(),
    minSalary: z.coerce.number().min(0).default(0),
    maxSalary: z.coerce.number().min(0).default(0),
    ethicalTags: z.array(z.string()).default([]),
    contact: z.string().email('Invalid email address'),
  })
  .refine(
    (data) => data.maxSalary >= data.minSalary,
    {
      message: 'Max salary must be greater than or equal to min salary',
      path: ['maxSalary'],
    }
  );

type JobFormValues = z.infer<typeof jobPostSchema>;

// Mock ethical policies - in a real app, these might come from an API or config
const ETHICAL_POLICY_OPTIONS = [
  { id: 'fair-wage', label: 'Fair Wage' },
  { id: 'equal-opportunity', label: 'Equal Opportunity' },
  { id: 'work-life-balance', label: 'Work-Life Balance' },
  { id: 'eco-friendly', label: 'Eco-Friendly Practices' },
  { id: 'transparency', label: 'Transparency' },
];

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const createJobMutation = useCreateJob();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobPostSchema) as Resolver<JobFormValues>,
    defaultValues: {
      title: '',
      description: '',
      companyName: '',
      location: '',
      isRemote: false,
      minSalary: 0,
      maxSalary: 0,
      ethicalTags: [],
      contact: '',
    },
  });

  const onSubmit = handleSubmit(async (data: JobFormValues) => {
    try {
      // Transform form data to match JobPost structure
      const jobPostData: Partial<JobPost> = {
        title: data.title,
        description: data.description,
        company: data.companyName,
        location: data.location,
        remote: data.isRemote,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        ethicalTags: data.ethicalTags,
      };

      await createJobMutation.mutateAsync(jobPostData as JobPost);
      navigate('/dashboard/jobs'); // Redirect to dashboard after creation
    } catch (error) {
      console.error('Error creating job post:', error);
    }
  });

  const selectedEthicalTags = watch('ethicalTags');

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Create New Job Post
        </Typography>
        <form onSubmit={onSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Title"
                  variant="outlined"
                  fullWidth
                  error={!!errors.title}
                  helperText={errors.title?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                />
              )}
            />

            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Company Name"
                  variant="outlined"
                  fullWidth
                  error={!!errors.companyName}
                  helperText={errors.companyName?.message}
                />
              )}
            />

            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Location (e.g., City, State or 'Remote')"
                  variant="outlined"
                  fullWidth
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}
            />

            <Controller
              name="isRemote"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label="Remote option is available"
                />
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="minSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Salary"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.minSalary}
                    helperText={errors.minSalary?.message}
                  />
                )}
              />
              <Controller
                name="maxSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maximum Salary"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.maxSalary}
                    helperText={errors.maxSalary?.message}
                  />
                )}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Ethical Policies
            </Typography>
            <FormGroup sx={{ pl: 1 }}>
              {ETHICAL_POLICY_OPTIONS.map((policy) => (
                <Controller
                  name="ethicalTags"
                  control={control}
                  key={policy.id}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedEthicalTags.includes(policy.id)}
                          onChange={(e) => {
                            const newTags = e.target.checked
                              ? [...selectedEthicalTags, policy.id]
                              : selectedEthicalTags.filter(
                                  (id) => id !== policy.id
                                );
                            field.onChange(newTags);
                          }}
                        />
                      }
                      label={policy.label}
                    />
                  )}
                />
              ))}
            </FormGroup>

            <Controller
              name="contact"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Email for Applications"
                  variant="outlined"
                  fullWidth
                  type="email"
                  error={!!errors.contact}
                  helperText={errors.contact?.message}
                />
              )}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              sx={{ mt: 2, py: 1.5 }}
            >
              {isSubmitting ? 'Submitting...' : 'Create Job Post'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateJobPage;
