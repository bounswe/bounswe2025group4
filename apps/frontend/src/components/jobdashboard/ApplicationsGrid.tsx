import React, { useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowParams,
  GridActionsCellItem,
  GridValueFormatter,
} from '@mui/x-data-grid';
import { Box, Button, Chip, Typography, useTheme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Application } from '../../types/application';
import { ApplicationStatusUpdate } from '../../schemas/job';
import ViewApplicationDialog from './ViewApplicationDialog';
import UpdateStatusDialog from './UpdateStatusDialog';

interface ApplicationsGridProps {
  jobId: string;
  jobTitle: string;
  applications: Application[];
  isLoading: boolean;
  onUpdateStatus: (
    applicationId: string,
    data: ApplicationStatusUpdate
  ) => Promise<void>;
  onBackToJobs: () => void;
}

const ApplicationsGrid: React.FC<ApplicationsGridProps> = ({
  jobTitle,
  applications,
  isLoading,
  onUpdateStatus,
  onBackToJobs,
}) => {
  const theme = useTheme();
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const handleViewApplication = (application: Application) => {
    setSelectedApplication(application);
    setViewDialogOpen(true);
  };

  const handleStatusUpdate = (application: Application) => {
    setSelectedApplication(application);
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

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Approved"
            color="success"
            size="small"
          />
        );
      case 'REJECTED':
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
      minWidth: 100,
    },
    {
      field: 'title',
      headerName: 'Job Title',
      width: 200,
    },
    {
      field: 'submissionDate',
      headerName: 'Applied On',
      width: 120,
      valueFormatter: (value: Date) => {
        if (!value) return '';
        return value.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams<Application>) => {
        return getStatusChip(params.row.status);
      },
    },
    {
      field: 'feedback',
      headerName: 'Feedback',
      width: 200,
      valueGetter: (feedback: string) => {
        if (!feedback) return 'No feedback provided';
        return feedback;
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams<Application>) => [
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
          color="primary"
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

      <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <DataGrid
          rows={applications}
          columns={columns}
          loading={isLoading}
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
            color: 'inherit',
            '& .MuiDataGrid-columnHeader': {
              backgroundColor: theme.palette.background.paper,
            },
            '& .MuiDataGrid-columnHeader:hover': {
              backgroundColor: theme.palette.action.selected,
              color: theme.palette.text.primary,
            },
            '& .MuiDataGrid-cell': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.divider,
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: theme.palette.background.default,
              borderTop: `1px solid ${theme.palette.divider}`,
            },
            '& .MuiTablePagination-root': {
              color: 'inherit',
            },
            '& .MuiTablePagination-actions': {
              color: 'inherit',
            },
          }}
        />
      </Box>

      <ViewApplicationDialog
        open={viewDialogOpen}
        application={selectedApplication}
        onClose={handleCloseView}
      />

      <UpdateStatusDialog
        open={statusDialogOpen}
        application={selectedApplication}
        onClose={handleCloseStatus}
        onUpdateStatus={onUpdateStatus}
      />
    </Box>
  );
};

export default ApplicationsGrid;
