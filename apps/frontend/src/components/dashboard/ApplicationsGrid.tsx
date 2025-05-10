import React, { useState } from 'react';
import {
  DataGridPro,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridActionsCellItem,
} from '@mui/x-data-grid-pro';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  useTheme,
  CircularProgress,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  applicationStatusSchema,
  ApplicationStatusUpdate,
} from '../../schemas/job';

export interface JobApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  resume: string;
  coverLetter: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
  feedback?: string;
}

interface ApplicationsGridProps {
  jobId: string;
  jobTitle: string;
  applications: JobApplication[];
  isLoading: boolean;
  onUpdateStatus: (
    applicationId: string,
    data: ApplicationStatusUpdate
  ) => void;
  onBackToJobs: () => void;
}

const ApplicationsGrid: React.FC<ApplicationsGridProps> = ({
  jobId,
  jobTitle,
  applications,
  isLoading,
  onUpdateStatus,
  onBackToJobs,
}) => {
  const theme = useTheme();
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ApplicationStatusUpdate>({
    resolver: zodResolver(applicationStatusSchema),
    defaultValues: {
      status: 'Pending',
      feedback: '',
    },
  });

  const handleViewApplication = (application: JobApplication) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = (application: JobApplication) => {
    setSelectedApplication(application);
    reset({ status: application.status, feedback: application.feedback || '' });
    setStatusDialogOpen(true);
  };

  const handleCloseView = () => {
    setViewDialogOpen(false);
    setSelectedApplication(null);
  };

  const handleCloseStatus = () => {
    setStatusDialogOpen(false);
    setSelectedApplication(null);
  };

  const onStatusSubmit = async (data: ApplicationStatusUpdate) => {
    if (!selectedApplication) return;

    setIsSubmitting(true);
    try {
      await onUpdateStatus(selectedApplication.id, data);
      setStatusDialogOpen(false);
      setSelectedApplication(null);
    } catch (error) {
      console.error('Failed to update application status:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      case 'Rejected':
        return (
          <Chip
            icon={<CancelIcon />}
            label="Rejected"
            color="error"
            size="small"
          />
        );
      default:
        return (
          <Chip
            icon={<AccessTimeIcon />}
            label="Pending"
            color="warning"
            size="small"
          />
        );
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'applicantName',
      headerName: 'Applicant',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'applicantEmail',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'appliedDate',
      headerName: 'Applied On',
      width: 120,
      valueFormatter: ({ value }) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams<JobApplication>) => {
        return getStatusChip(params.row.status);
      },
    },
    {
      field: 'feedback',
      headerName: 'Feedback',
      width: 200,
      valueGetter: (params) => params.row.feedback || 'No feedback provided',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams<JobApplication>) => [
        <GridActionsCellItem
          icon={<CheckCircleIcon />}
          label="Update Status"
          onClick={() => handleStatusUpdate(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View Details"
          onClick={() => handleViewApplication(params.row)}
          color="info"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          alignItems: 'center',
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBackToJobs}
        >
          Back to Jobs
        </Button>
        <Typography variant="h6">Applications for "{jobTitle}"</Typography>
      </Box>

      <DataGridPro
        rows={applications}
        columns={columns}
        loading={isLoading}
        autoHeight
        disableRowSelectionOnClick
        pageSizeOptions={[10, 25, 50]}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        sx={{
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        }}
      />

      {/* View Application Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseView}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Application Details</DialogTitle>
        <DialogContent>
          {selectedApplication && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedApplication.applicantName}
              </Typography>

              <Typography variant="subtitle1" gutterBottom>
                {selectedApplication.applicantEmail}
              </Typography>

              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Applied on:{' '}
                {new Date(selectedApplication.appliedDate).toLocaleDateString()}
              </Typography>

              <Box sx={{ mt: 2, mb: 2 }}>
                {getStatusChip(selectedApplication.status)}
              </Box>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Cover Letter
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  mt: 1,
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {selectedApplication.coverLetter}
              </Typography>

              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Resume
              </Typography>

              <Button
                variant="outlined"
                sx={{ mt: 1 }}
                component="a"
                href={selectedApplication.resume}
                target="_blank"
                rel="noopener"
              >
                View Resume
              </Button>

              {selectedApplication.feedback && (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mt: 2 }}
                  >
                    Feedback
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      mt: 1,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                    }}
                  >
                    {selectedApplication.feedback}
                  </Typography>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseView}>Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              handleCloseView();
              handleStatusUpdate(selectedApplication!);
            }}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={statusDialogOpen}
        onClose={handleCloseStatus}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Application Status</DialogTitle>
        <form onSubmit={handleSubmit(onStatusSubmit)}>
          <DialogContent>
            {selectedApplication && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedApplication.applicantName} -{' '}
                  {selectedApplication.applicantEmail}
                </Typography>

                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <FormControl
                      fullWidth
                      sx={{ mt: 2 }}
                      error={!!errors.status}
                    >
                      <InputLabel id="status-label">Status</InputLabel>
                      <Select
                        {...field}
                        labelId="status-label"
                        label="Status"
                        disabled={isSubmitting}
                      >
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Approved">Approved</MenuItem>
                        <MenuItem value="Rejected">Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="feedback"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Feedback to Applicant"
                      fullWidth
                      multiline
                      rows={4}
                      sx={{ mt: 2 }}
                      error={!!errors.feedback}
                      helperText={errors.feedback?.message}
                      disabled={isSubmitting}
                    />
                  )}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseStatus} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ApplicationsGrid;
