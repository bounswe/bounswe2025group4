import React from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Paper,
  MenuItem,
  Checkbox,
  FormControlLabel,
  FormGroup,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Zod schema for validation (as per roadmap)
const jobPostSchema = z
  .object({
    title: z.string().min(5, 'Title must be at least 5 characters long'),
    description: z
      .string()
      .min(20, 'Description must be at least 20 characters long'),
    companyName: z.string().min(2, 'Company name is required'),
    location: z.string().min(2, 'Location is required'),
    employmentType: z.enum([
      'Full-time',
      'Part-time',
      'Contract',
      'Internship',
      'Temporary',
    ]),
    salaryMin: z.coerce.number().optional(),
    salaryMax: z.coerce.number().optional(),
    ethicalPolicies: z.array(z.string()).optional(), // Example: could be IDs or specific policy strings
    contactEmail: z.string().email('Invalid email address'),
  })
  .refine(
    (data) =>
      !data.salaryMin || !data.salaryMax || data.salaryMax >= data.salaryMin,
    {
      message: 'Max salary must be greater than or equal to min salary',
      path: ['salaryMax'],
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

// Mock API call for creating a job post
const createJobPostAPI = async (data: JobFormValues) => {
  console.log('Submitting job post data:', data);
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // In a real app, handle success/error responses from the API
  // For example:
  // const response = await fetch('/api/jobs', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json', /* Authorization header */ },
  //   body: JSON.stringify(data),
  // });
  // if (!response.ok) throw new Error('Failed to create job post');
  // return response.json();
  return { id: `new-job-${Date.now()}`, ...data }; // Return mock response
};

const CreateJobPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: '',
      description: '',
      companyName: '',
      location: '',
      employmentType: 'Full-time',
      salaryMin: undefined,
      salaryMax: undefined,
      ethicalPolicies: [],
      contactEmail: '',
    },
  });

  const onSubmit: SubmitHandler<JobFormValues> = async (data) => {
    try {
      await createJobPostAPI(data);
      // alert('Job post created successfully!'); // Or use a snackbar notification
      navigate('/dashboard/jobs'); // Redirect to dashboard after creation
    } catch (error) {
      console.error('Error creating job post:', error);
      // alert('Failed to create job post. See console for details.'); // Or use a snackbar
    }
  };

  const selectedEthicalPolicies = watch('ethicalPolicies') || [];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Create New Job Post
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
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
              name="employmentType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Employment Type"
                  variant="outlined"
                  fullWidth
                  error={!!errors.employmentType}
                  helperText={errors.employmentType?.message}
                >
                  {[
                    'Full-time',
                    'Part-time',
                    'Contract',
                    'Internship',
                    'Temporary',
                  ].map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller
                name="salaryMin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Salary (Optional)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.salaryMin}
                    helperText={errors.salaryMin?.message}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
              <Controller
                name="salaryMax"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maximum Salary (Optional)"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!errors.salaryMax}
                    helperText={errors.salaryMax?.message}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ''
                          ? undefined
                          : Number(e.target.value)
                      )
                    }
                  />
                )}
              />
            </Box>

            <Typography variant="subtitle1" sx={{ mt: 1 }}>
              Ethical Policies (Optional)
            </Typography>
            <FormGroup sx={{ pl: 1 }}>
              {ETHICAL_POLICY_OPTIONS.map((policy) => (
                <Controller
                  name="ethicalPolicies"
                  control={control}
                  key={policy.id}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedEthicalPolicies.includes(policy.id)}
                          onChange={(e) => {
                            const newPolicies = e.target.checked
                              ? [...selectedEthicalPolicies, policy.id]
                              : selectedEthicalPolicies.filter(
                                  (id) => id !== policy.id
                                );
                            field.onChange(newPolicies);
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
              name="contactEmail"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Contact Email for Applications"
                  variant="outlined"
                  fullWidth
                  type="email"
                  error={!!errors.contactEmail}
                  helperText={errors.contactEmail?.message}
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
