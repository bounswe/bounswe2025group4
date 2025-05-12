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
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';

import { JobPost } from '../../types/job';
import { useDeleteJob } from '../../services/jobs.service';
import ConfirmDialog from '../common/ConfirmDialog';

interface JobGridProps {
  jobs: JobPost[];
  isLoading: boolean;
  onEdit: (job: JobPost) => void;
  onCreateNew: () => void;
  onApplicationsView: (jobId: string) => void;
}

const JobGrid: React.FC<JobGridProps> = ({
  jobs,
  isLoading,
  onEdit,
  onCreateNew,
  onApplicationsView,
}) => {
  const theme = useTheme();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const deleteJobMutation = useDeleteJob();

  const handleEditClick = (job: JobPost) => {
    onEdit(job);
  };

  const handleDeleteClick = (id: string) => {
    setJobToDelete(id);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (jobToDelete) {
      try {
        await deleteJobMutation.mutateAsync(jobToDelete);
      } catch (error) {
        console.error('Failed to delete job:', error);
      }
    }
    setConfirmDialogOpen(false);
    setJobToDelete(null);
  };

  const handleDeleteCancel = () => {
    setConfirmDialogOpen(false);
    setJobToDelete(null);
  };

  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Job Title',
      flex: 1,
      minWidth: 180,
    },
    {
      field: 'location',
      headerName: 'Location',
      width: 150,
    },
    {
      field: 'employmentType',
      headerName: 'Type',
      width: 120,
    },
    {
      field: 'salary',
      headerName: 'Salary Range',
      width: 150,
      renderCell: (params: GridRenderCellParams<JobPost>) => {
        const salaryMin = params.row.minSalary;
        const salaryMax = params.row.maxSalary;
        if (salaryMin && salaryMax) {
          return `$${salaryMin / 1000}k - $${salaryMax / 1000}k`;
        } else if (salaryMin) {
          return `From $${salaryMin / 1000}k`;
        } else if (salaryMax) {
          return `Up to $${salaryMax / 1000}k`;
        }
        return 'Not specified';
      },
    },
    {
      field: 'ethicalPolicies',
      headerName: 'Ethical Policies',
      width: 200,
      renderCell: (params: GridRenderCellParams<JobPost>) => {
        const policies = params.row.ethicalTags;
        return (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {policies.slice(0, 2).map((policy: string) => (
              <Chip
                key={policy}
                label={policy}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
            {policies.length > 2 && (
              <Tooltip title={policies.slice(2).join(', ')}>
                <Chip
                  label={`+${policies.length - 2}`}
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            )}
          </Box>
        );
      },
    },
    {
      field: 'postedDate',
      headerName: 'Posted Date',
      width: 120,
      valueFormatter: ({ value }) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString();
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams<JobPost>) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditClick(params.row)}
          color="primary"
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(params.row.id.toString())}
          color="inherit"
        />,
        <GridActionsCellItem
          icon={<VisibilityIcon />}
          label="View Applications"
          onClick={() => onApplicationsView(params.row.id.toString())}
          color="inherit"
        />,
      ],
    },
  ];

  return (
    <Box sx={{ width: '100%', height: 500 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Manage Job Listings</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onCreateNew}
        >
          Create Job
        </Button>
      </Box>

      <Box display="flex" flexDirection="column" height="100%">
        <DataGridPro
          rows={jobs}
          columns={columns}
          loading={isLoading}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
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
      </Box>

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete Job Listing"
        content="Are you sure you want to delete this job listing? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={deleteJobMutation.isPending}
      />
    </Box>
  );
};

export default JobGrid;
