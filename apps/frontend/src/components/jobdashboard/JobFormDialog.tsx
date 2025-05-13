import React, { useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Grid,
  FormLabel,
  Divider,
  Box,
  Autocomplete,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { JobPost } from '../../types/job';
import {
  jobSchema,
  JobFormValues,
  ethicalPolicies,
  jobFormValueFromJobPost,
} from '../../schemas/job';

interface JobFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JobFormValues) => void;
  initialData?: JobPost;
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
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: initialData
      ? jobFormValueFromJobPost(initialData)
      : {
          title: '',
          description: '',
          location: '',
          minSalary: 0,
          maxSalary: 0,
          isRemote: false,
          ethicalTags: [],
          company: '',
          contact: '',
        },
  });

  // Watch for min/max salary to validate relationship
  const minSalary = watch('minSalary');
  const maxSalary = watch('maxSalary');

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      reset(
        initialData
          ? jobFormValueFromJobPost(initialData)
          : {
              title: '',
              description: '',
              location: '',
              minSalary: 0,
              maxSalary: 0,
              isRemote: false,
              ethicalTags: [],
              company: '',
              contact: '',
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
        Edit Job Listing
      </DialogTitle>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
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

            <Grid size={{ xs: 12 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
            <Controller
              name="isRemote"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isLoading}
                    />
                  }
                  label="Remote option is available"
                />
              )}
            />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="minSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Minimum Salary"
                    type="number"
                    fullWidth
                    error={!!errors.minSalary}
                    helperText={errors.minSalary?.message}
                    disabled={isLoading}
                    slotProps={{ htmlInput: { min: 0 } }}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="maxSalary"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Maximum Salary"
                    type="number"
                    fullWidth
                    error={
                        !!errors.maxSalary ||
                      (maxSalary !== undefined &&
                        minSalary !== undefined &&
                        maxSalary < minSalary)
                    }
                    helperText={
                      errors.maxSalary?.message ||
                      (maxSalary !== undefined &&
                      minSalary !== undefined &&
                      maxSalary < minSalary
                        ? 'Maximum salary must be greater than minimum salary'
                        : '')
                    }
                    disabled={isLoading}
                    slotProps={{ htmlInput: { min: 0 } }}
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

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                name="contact"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Contact Email"
                    fullWidth
                    error={!!errors.contact}
                    helperText={errors.contact?.message}
                    disabled={isLoading}
                    required
                  />
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="company"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.company}>
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
                    {errors.company && (
                      <FormHelperText>
                        {errors.company.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Controller
                name="ethicalTags"
                control={control}
                render={({ field }) => (
                  <FormControl
                    fullWidth
                    error={!!errors.ethicalTags}
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
                            error={!!errors.ethicalTags}
                            helperText={errors.ethicalTags?.message}
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
            {isLoading ? 'Saving...' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default JobFormDialog;
