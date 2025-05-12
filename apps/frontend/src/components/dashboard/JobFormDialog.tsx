import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Grid,
  Checkbox,
  FormGroup,
  FormLabel,
  Divider,
  Box,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Job } from '../../types/job';
import {
  jobSchema,
  JobFormValues,
  ethicalPolicies,
  employmentTypes,
} from '../../schemas/job';

interface JobFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormValues) => void;
  initialData?: Job;
  isLoading?: boolean;
  companies: { id: string; name: string }[];
}

const JobFormDialog: React.FC<JobFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  companies,
}) => {
  const isEditing = !!initialData;

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData
      ? {
          title: initialData.title,
          description: initialData.description,
          location: initialData.location,
          salaryMin: initialData.salaryMin,
          salaryMax: initialData.salaryMax,
          employmentType: initialData.employmentType,
          ethicalPolicies: initialData.ethicalPolicies,
          companyId: initialData.company.id,
          contactEmail: initialData.contactEmail || '',
          contactPhone: initialData.contactPhone || '',
        }
      : {
          title: '',
          description: '',
          location: '',
          employmentType: 'Full-time',
          ethicalPolicies: [],
          companyId: '',
          contactEmail: '',
        },
  });

  // Watch for min/max salary to validate relationship
  const salaryMin = watch('salaryMin');
  const salaryMax = watch('salaryMax');

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? {
              title: initialData.title,
              description: initialData.description,
              location: initialData.location,
              salaryMin: initialData.salaryMin,
              salaryMax: initialData.salaryMax,
              employmentType: initialData.employmentType,
              ethicalPolicies: initialData.ethicalPolicies,
              companyId: initialData.company.id,
              contactEmail: initialData.contactEmail || '',
              contactPhone: initialData.contactPhone || '',
            }
          : {
              title: '',
              description: '',
              location: '',
              employmentType: 'Full-time',
              ethicalPolicies: [],
              companyId: '',
              contactEmail: '',
            }
      );
    }
  }, [open, initialData, reset]);

  const onFormSubmit = (data: JobFormValues) => {
    onSubmit(data);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="job-form-dialog-title"
    >
      <DialogTitle id="job-form-dialog-title">
        {isEditing ? 'Edit Job Listing' : 'Create New Job Listing'}
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Job Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    disabled={isLoading}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Job Description"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    disabled={isLoading}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Location"
                    fullWidth
                    error={!!errors.location}
                    helperText={errors.location?.message}
                    disabled={isLoading}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="employmentType"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.employmentType}>
                    <InputLabel id="employment-type-label">
                      Employment Type
                    </InputLabel>
                    <Select
                      {...field}
                      labelId="employment-type-label"
                      label="Employment Type"
                      disabled={isLoading}
                      required
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.employmentType && (
                      <FormHelperText>
                        {errors.employmentType.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="salaryMin"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Salary"
                    type="number"
                    fullWidth
                    error={!!errors.salaryMin}
                    helperText={errors.salaryMin?.message}
                    disabled={isLoading}
                    InputProps={{ inputProps: { min: 0 } }}
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      field.onChange(value);
                    }}
                    value={field.value || ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="salaryMax"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maximum Salary"
                    type="number"
                    fullWidth
                    error={
                      !!errors.salaryMax ||
                      (salaryMax !== undefined &&
                        salaryMin !== undefined &&
                        salaryMax < salaryMin)
                    }
                    helperText={
                      errors.salaryMax?.message ||
                      (salaryMax !== undefined &&
                      salaryMin !== undefined &&
                      salaryMax < salaryMin
                        ? 'Maximum salary must be greater than minimum salary'
                        : '')
                    }
                    disabled={isLoading}
                    InputProps={{ inputProps: { min: 0 } }}
                    onChange={(e) => {
                      const value = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      field.onChange(value);
                    }}
                    value={field.value || ''}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="contactEmail"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Email"
                    fullWidth
                    error={!!errors.contactEmail}
                    helperText={errors.contactEmail?.message}
                    disabled={isLoading}
                    required
                  />
                )}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Controller
                name="contactPhone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Phone"
                    fullWidth
                    error={!!errors.contactPhone}
                    helperText={errors.contactPhone?.message}
                    disabled={isLoading}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="companyId"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.companyId}>
                    <InputLabel id="company-label">Company</InputLabel>
                    <Select
                      {...field}
                      labelId="company-label"
                      label="Company"
                      disabled={isLoading}
                      required
                    >
                      {companies.map((company) => (
                        <MenuItem key={company.id} value={company.id}>
                          {company.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.companyId && (
                      <FormHelperText>
                        {errors.companyId.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="ethicalPolicies"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.ethicalPolicies}
                    component="fieldset"
                    variant="standard"
                  >
                    <FormLabel component="legend">Ethical Policies</FormLabel>
                    <FormHelperText>
                      Select at least one ethical policy that this job adheres
                      to
                    </FormHelperText>
                    <Box sx={{ mt: 2 }}>
                      <Autocomplete
                        multiple
                        id="ethical-policies-select"
                        options={ethicalPolicies}
                        disabled={isLoading}
                        value={field.value}
                        onChange={(_, newValue) => {
                          field.onChange(newValue);
                        }}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              label={option}
                              {...getTagProps({ index })}
                              color="primary"
                              variant="outlined"
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Select policies"
                            error={!!errors.ethicalPolicies}
                            helperText={errors.ethicalPolicies?.message}
                          />
                        )}
                      />
                    </Box>
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobFormDialog;
