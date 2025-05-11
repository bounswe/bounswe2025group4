import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  // Forum as ForumIcon,
} from '@mui/icons-material';
import {
  useUserProfileById,
  useUpdateUserProfile,
  useWorkExperience,
  useUserBadges,
  // useForumActivityCount,
  useEducation,
  useProfilePictureUpload,
} from '../../services/profile.service';

import ProfilePictureUpload from '../../components/profile/ProfilePictureUpload';
import BadgeDisplay from '../../components/profile/BadgeDisplay';
import WorkHistory from '../../components/profile/WorkHistory';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CenteredLoader from '../../components/layout/CenterLoader';
import { useUserById } from '../../services/user.service';

// Form validation schema
const bioSchema = z.object({
  bio: z.string().max(500, 'Bio must be 500 characters or less'),
});

type BioFormData = z.infer<typeof bioSchema>;

/**
 * User Profile page component
 * Accessible via /u/:id
 */
const UserProfile: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);

  // Fetch user data
  const {
    data: user,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserProfileById(parseInt(id || ''));

  // Fetch education if user exists
  const { data: education = [], isLoading: isLoadingEducation } = useEducation(
    user?.id || 0
  );

  // Fetch work history if user exists
  const { data: workHistory = [], isLoading: isLoadingWork } =
    useWorkExperience(user?.id || 0);

  // Fetch badges if user exists
  const { data: badges = [], isLoading: isLoadingBadges } = useUserBadges(
    user?.id || 0
  );

  const { data: authUser, isLoading: isLoadingAuthUser } = useUserById(
    parseInt(id || '')
  );

  // Fetch forum activity count if user exists
  // const { data: forumActivityCount = 0, isLoading: isLoadingActivity } =
  //   useForumActivityCount(user?.id || '');

  // Update user profile mutation
  const updateUserProfile = useUpdateUserProfile(user?.id || 0);
  // Update profile picture mutation
  const updateProfilePicture = useProfilePictureUpload(user?.id || 0);

  // Get the current user ID from local storage to check if the profile belongs to the current user
  const currentUserId = localStorage.getItem('id');
  const isOwnProfile =
    !!user && !!currentUserId && user.id === parseInt(currentUserId || '0');

  // Form for editing bio
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BioFormData>({
    resolver: zodResolver(bioSchema),
    defaultValues: {
      bio: user?.bio || '',
    },
  });

  // Update form defaults when user data is loaded
  useEffect(() => {
    if (user) {
      reset({ bio: user.bio || '' });
    }
  }, [user, reset]);

  // Handle bio form submission
  const onSubmitBio = async (data: BioFormData) => {
    if (!user) return;

    try {
      await updateUserProfile.mutateAsync({
        bio: data.bio,
      });

      setIsEditingBio(false);
    } catch (error) {
      console.error('Failed to update bio:', error);
    }
  };

  // Cancel bio editing
  const cancelBioEdit = () => {
    reset({ bio: user?.bio || '' });
    setIsEditingBio(false);
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  // Handle avatar change
  const handleProfilePictureChange = async (newPicture: File) => {
    if (!user) return;

    try {
      await updateProfilePicture.mutateAsync(newPicture);
    } catch (error) {
      console.error('Failed to update profile picture:', error);
    }
  };

  // Loading state
  if (
    isLoadingUser ||
    isLoadingEducation ||
    isLoadingWork ||
    isLoadingBadges ||
    isLoadingAuthUser
  ) {
    return <CenteredLoader />;
  }

  // Error state
  if (userError || !user) {
    return (
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {userError ? 'Error loading user profile' : 'User not found'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Return to Homepage
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 4 }}>
        <Box
          display="flex"
          flexDirection={isMobile ? 'column' : 'row'}
          alignItems={isMobile ? 'center' : 'flex-start'}
          gap={4}
        >
          {/* Profile Picture
          <ProfilePictureUpload
            userId={user.id}
            profilePictureUrl={user.profilePicture}
            size={isMobile ? 100 : 150}
            editable={isOwnProfile}
            onPictureChange={handleProfilePictureChange}
          /> */}

          {/* User info */}
          <Box flex={1}>
            <Typography variant="h4" gutterBottom>
              {authUser?.username}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              {authUser?.email}
            </Typography>

            <Box mt={2} mb={3}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {authUser?.userType === 'EMPLOYER' ? 'Employer' : 'Job Seeker'}
                {authUser?.mentorType === 'MENTOR' && ' • Mentor'}
              </Typography>
            </Box>

            {/* Bio */}
            <Box mt={2}>
              {isEditingBio ? (
                <form onSubmit={handleSubmit(onSubmitBio)}>
                  <Controller
                    name="bio"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        multiline
                        rows={4}
                        fullWidth
                        label="Bio"
                        placeholder="Tell us about yourself..."
                        error={!!errors.bio}
                        helperText={
                          errors.bio?.message ||
                          `${field.value.length}/500 characters`
                        }
                      />
                    )}
                  />

                  <Box mt={2} display="flex" gap={1}>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={updateUserProfile.isPending}
                    >
                      Save
                    </Button>

                    <Button
                      onClick={cancelBioEdit}
                      variant="outlined"
                      startIcon={<CancelIcon />}
                    >
                      Cancel
                    </Button>
                  </Box>
                </form>
              ) : (
                <Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="flex-start"
                  >
                    <Typography variant="h6">Bio</Typography>

                    {isOwnProfile && (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => setIsEditingBio(true)}
                        size="small"
                      >
                        Edit
                      </Button>
                    )}
                  </Box>

                  <Typography variant="body1" whiteSpace="pre-wrap">
                    {user.bio || 'No bio added yet.'}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Tabs for different sections */}
      {/* <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="Profile tabs"
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          <Tab label="Work Experience" />
          <Tab label="Badges" />
          <Tab label="Forum Activity" />
        </Tabs>
      </Box> */}

      {/* Tab Panels */}

      {/* Work History */}
      {/* <Box
        role="tabpanel"
        hidden={tabIndex !== 0}
        id={`tabpanel-${0}`}
        sx={{ pb: 4 }}
      >
        {tabIndex === 0 && (
          <WorkHistory
            userId={user.id}
            workHistory={workHistory}
            isEditable={isOwnProfile}
          />
        )}
      </Box> */}

      {/* Badges */}
      {/* <Box
        role="tabpanel"
        hidden={tabIndex !== 1}
        id={`tabpanel-${1}`}
        sx={{ pb: 4 }}
      >
        {tabIndex === 1 && <BadgeDisplay badges={badges} />}
      </Box> */}

      {/* Forum Activity */}
      {/* <Box
        role="tabpanel"
        hidden={tabIndex !== 2}
        id={`tabpanel-${2}`}
        sx={{ pb: 4 }}
      >
        {tabIndex === 2 && (
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ForumIcon color="primary" fontSize="large" />

                <Box>
                  <Typography variant="h6">Forum Activity</Typography>
                  <Typography variant="body1">
                    {forumActivityCount}{' '}
                    {forumActivityCount === 1 ? 'post' : 'posts'} in the
                    community forum
                  </Typography>
                </Box>
              </Box>

              {forumActivityCount > 0 && (
                <Button
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/forum')}
                >
                  View Forum
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </Box> */}
    </Container>
  );
};

export default UserProfile;
