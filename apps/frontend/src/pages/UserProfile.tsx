// src/pages/UserProfile/index.tsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryResult,
  UseMutationResult,
} from '@tanstack/react-query';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useDropzone,
  DropzoneRootProps,
  DropzoneInputProps,
} from 'react-dropzone';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItemAvatar,
  Paper,
  TextField,
  Typography,
  useTheme,
  Chip,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Work as WorkIcon,
  Forum as ForumIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';
import { useUserStore, User } from '../../stores/userStore';
import {
  fetchUserProfileById,
  updateUserProfile,
  getPresignedUrl,
  uploadToS3,
  PresignedUrlResponse,
} from '../../api/userApi';

// Types
interface WorkExperience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
}

interface UserProfileData {
  id: string;
  username: string;
  avatarUrl: string;
  bio: string;
  workExperience: WorkExperience[];
  forumActivityCount: number;
  badges: Badge[];
}

// Validation schemas
const workExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const profileSchema = z.object({
  bio: z.string().max(500, 'Bio must be less than 500 characters'),
  workExperience: z.array(workExperienceSchema),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const UserProfile = () => {
  const { id: userId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Global user state
  const currentUser: User | null = useUserStore(
    (state: { user: User | null }) => state.user
  );
  const isCurrentUser = currentUser?.id === userId;

  // Local state
  const [isEditing, setIsEditing] = useState(false);
  const [showWorkExperienceModal, setShowWorkExperienceModal] = useState(false);
  const [currentWorkExperience, setCurrentWorkExperience] =
    useState<WorkExperience | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form setup
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: '',
      workExperience: [],
    },
  });

  // Work experience form
  const workExperienceForm = useForm<WorkExperience>({
    resolver: zodResolver(workExperienceSchema),
    defaultValues: {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    },
  });

  // Avatar dropzone setup
  const {
    getRootProps,
    getInputProps,
  }: {
    getRootProps: (
      props?: React.HTMLAttributes<HTMLElement>
    ) => DropzoneRootProps;
    getInputProps: (
      props?: React.InputHTMLAttributes<HTMLInputElement>
    ) => DropzoneInputProps;
  } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    },
    maxSize: 5242880, // 5MB
    multiple: false,
    onDrop: async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file || !currentUser) return;

      await handleAvatarUpload(file);
    },
  });

  // Fetch user profile data
  const {
    data: profile,
    isLoading,
    isError,
    error,
  }: UseQueryResult<UserProfileData, Error> = useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => {
      if (!userId) throw new Error('User ID is not available');
      return fetchUserProfileById(userId);
    },
    enabled: !!userId,
    onSuccess: (data: UserProfileData | undefined) => {
      if (data) {
        reset({
          bio: data.bio || '',
          workExperience: data.workExperience || [],
        });
      }
    },
  });

  // Update profile mutation
  const updateProfileMutation: UseMutationResult<
    UserProfileData,
    Error,
    Partial<UserProfileData>,
    { previousProfile?: UserProfileData }
  > = useMutation({
    mutationFn: (updateData: Partial<UserProfileData>) => {
      if (!profile) throw new Error('Profile data not available for update');
      return updateUserProfile({ ...updateData, id: profile.id });
    },
    onMutate: async (newProfileData: Partial<UserProfileData>) => {
      await queryClient.cancelQueries({ queryKey: ['userProfile', userId] });
      const previousProfile = queryClient.getQueryData<UserProfileData>([
        'userProfile',
        userId,
      ]);
      if (previousProfile) {
        queryClient.setQueryData<UserProfileData>(
          ['userProfile', userId],
          (old) => ({
            ...(old as UserProfileData),
            ...newProfileData,
          })
        );
      }
      return { previousProfile };
    },
    onError: (err, newProfileData, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(
          ['userProfile', userId],
          context.previousProfile
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
    },
  });

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!profile) return;

    try {
      setIsUploading(true);

      const presignedUrlData: PresignedUrlResponse = await getPresignedUrl(
        file.name,
        file.type
      );

      await uploadToS3(presignedUrlData.url, file);

      await updateProfileMutation.mutateAsync({
        avatarUrl: presignedUrlData.fileUrl,
      });

      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setIsUploading(false);
    }
  };

  // Handle file input change (for compatibility with traditional file input)
  const handleFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      await handleAvatarUpload(file);
    }
  };

  // Handle profile update
  const onSubmitProfile = async (data: ProfileFormValues) => {
    if (!profile) return;

    await updateProfileMutation.mutateAsync({
      bio: data.bio,
      workExperience: data.workExperience,
    });

    setIsEditing(false);
  };

  // Handle work experience form
  const handleAddWorkExperience = () => {
    setCurrentWorkExperience(null);
    workExperienceForm.reset({
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setShowWorkExperienceModal(true);
  };

  const handleEditWorkExperience = (experience: WorkExperience) => {
    setCurrentWorkExperience(experience);
    workExperienceForm.reset(experience);
    setShowWorkExperienceModal(true);
  };

  const handleDeleteWorkExperience = (experienceId: string) => {
    if (!profile) return;

    const updatedExperiences = profile.workExperience.filter(
      (exp: WorkExperience) => exp.id !== experienceId
    );

    updateProfileMutation.mutate({
      workExperience: updatedExperiences,
    });
  };

  const handleSaveWorkExperience = async () => {
    try {
      const values = await workExperienceForm.handleSubmit((data) => data)();

      if (!profile) return;

      let updatedExperiences: WorkExperience[];

      if (currentWorkExperience) {
        updatedExperiences = profile.workExperience.map(
          (exp: WorkExperience) =>
            exp.id === currentWorkExperience.id
              ? { ...values, id: exp.id }
              : exp
        );
      } else {
        const newExperience = {
          ...values,
          id: `exp-${Date.now()}`,
        };
        updatedExperiences = [...profile.workExperience, newExperience];
      }

      await updateProfileMutation.mutateAsync({
        workExperience: updatedExperiences,
      });

      setShowWorkExperienceModal(false);
    } catch (error) {
      console.error('Error saving work experience:', error);
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }} data-testid="skeleton-loading">
        <Paper sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" mb={3}>
            <Skeleton variant="circular" width={100} height={100} />
            <Box ml={3} width="100%">
              <Skeleton variant="text" width="50%" height={40} />
              <Skeleton variant="text" width="70%" height={20} />
            </Box>
          </Box>
          <Divider sx={{ my: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={100} />
          <Divider sx={{ my: 3 }} />
          <Skeleton variant="rectangular" width="100%" height={200} />
        </Paper>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            Error loading profile
          </Typography>
          <Typography>
            {error instanceof Error ? error.message : 'Something went wrong'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            User not found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 } }}>
        {/* Profile Header */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
          mb={3}
        >
          <Box
            position="relative"
            {...getRootProps()}
            sx={{ cursor: isEditing && isCurrentUser ? 'pointer' : 'default' }}
          >
            <input {...getInputProps()} data-testid="avatar-upload" />
            <Avatar
              src={profile.avatarUrl}
              alt={profile.username}
              sx={{
                width: 120,
                height: 120,
                border: `2px solid ${theme.palette.primary.main}`,
              }}
            />
            {isEditing && isCurrentUser && (
              <Box position="absolute" bottom={0} right={0}>
                <IconButton
                  component="span"
                  color="primary"
                  sx={{
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.default' },
                  }}
                  disabled={isUploading}
                  aria-label="Upload avatar"
                >
                  {isUploading ? (
                    <CircularProgress size={24} />
                  ) : (
                    <PhotoCameraIcon />
                  )}
                </IconButton>
              </Box>
            )}
          </Box>
          <Box
            ml={{ xs: 0, sm: 3 }}
            mt={{ xs: 2, sm: 0 }}
            textAlign={{ xs: 'center', sm: 'left' }}
            width="100%"
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent={{ xs: 'center', sm: 'space-between' }}
            >
              <Typography variant="h4" gutterBottom>
                {profile.username}
              </Typography>
              {isCurrentUser && (
                <Box>
                  {isEditing ? (
                    <Box>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<SaveIcon />}
                        onClick={handleSubmit(onSubmitProfile)}
                        sx={{ mr: 1 }}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => {
                          setIsEditing(false);
                          reset({
                            bio: profile.bio,
                            workExperience: profile.workExperience,
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  )}
                </Box>
              )}
            </Box>

            {/* Stats and Badges */}
            <Box
              display="flex"
              flexWrap="wrap"
              gap={2}
              mt={2}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
            >
              <Chip
                icon={<ForumIcon fontSize="small" />}
                label={`${profile.forumActivityCount} Forum Posts`}
                variant="outlined"
              />
              {profile.badges.map((badge: Badge) => (
                <Chip
                  key={badge.id}
                  label={badge.name}
                  color="primary"
                  title={badge.description}
                />
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Bio Section */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            About
          </Typography>
          {isEditing ? (
            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  error={!!errors.bio}
                  helperText={errors.bio?.message}
                />
              )}
            />
          ) : (
            <Typography variant="body1">
              {profile.bio || 'No bio provided'}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Work Experience Section */}
        <Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6">Work Experience</Typography>
            {isEditing && (
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={handleAddWorkExperience}
              >
                Add Experience
              </Button>
            )}
          </Box>

          {profile.workExperience.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No work experience added yet
            </Typography>
          ) : (
            <List>
              {profile.workExperience.map((experience: WorkExperience) => (
                <Card key={experience.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between">
                      <Box display="flex" alignItems="center">
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                            <WorkIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <Box>
                          <Typography variant="h6">
                            {experience.position}
                          </Typography>
                          <Typography variant="subtitle1">
                            {experience.company}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {experience.startDate}
                            {experience.endDate
                              ? ` - ${experience.endDate}`
                              : ' - Present'}
                          </Typography>
                        </Box>
                      </Box>
                      {isEditing && (
                        <Box>
                          <IconButton
                            size="small"
                            data-testid="edit-experience-button"
                            onClick={() => handleEditWorkExperience(experience)}
                            aria-label="Edit work experience"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            data-testid="delete-experience-button"
                            onClick={() =>
                              handleDeleteWorkExperience(experience.id)
                            }
                            aria-label="Delete work experience"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    {experience.description && (
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        {experience.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </List>
          )}
        </Box>
      </Paper>

      {/* Work Experience Modal */}
      <Dialog
        open={showWorkExperienceModal}
        onClose={() => setShowWorkExperienceModal(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {currentWorkExperience
            ? 'Edit Work Experience'
            : 'Add Work Experience'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="company"
                control={workExperienceForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Company"
                    error={!!workExperienceForm.formState.errors.company}
                    helperText={
                      workExperienceForm.formState.errors.company?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="position"
                control={workExperienceForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Position"
                    error={!!workExperienceForm.formState.errors.position}
                    helperText={
                      workExperienceForm.formState.errors.position?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="startDate"
                control={workExperienceForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="Start Date"
                    placeholder="MM/YYYY"
                    error={!!workExperienceForm.formState.errors.startDate}
                    helperText={
                      workExperienceForm.formState.errors.startDate?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Controller
                name="endDate"
                control={workExperienceForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label="End Date"
                    placeholder="MM/YYYY or leave blank for current"
                    error={!!workExperienceForm.formState.errors.endDate}
                    helperText={
                      workExperienceForm.formState.errors.endDate?.message
                    }
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Controller
                name="description"
                control={workExperienceForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    error={!!workExperienceForm.formState.errors.description}
                    helperText={
                      workExperienceForm.formState.errors.description?.message
                    }
                  />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWorkExperienceModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveWorkExperience} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile;
