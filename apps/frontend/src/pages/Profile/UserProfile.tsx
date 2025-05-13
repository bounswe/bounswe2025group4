import { FC, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Grid,
  List,
  ListItemText,
  ListItemButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person,
  Handshake,
} from '@mui/icons-material';
import {
  useUserProfileById,
  useUpdateUserProfile,
} from '../../services/profile.service';

import ProfilePictureUpload from '../../components/profile/ProfilePictureUpload';
import BadgeDisplay from '../../components/profile/BadgeDisplay';
import WorkHistory from '../../components/profile/WorkHistory';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CenteredLoader from '../../components/layout/CenterLoader';
import { useUpdateUser, useUserById } from '../../services/user.service';
import EducationHistory from '../../components/profile/EducationHistory';
import SkillsSection from '../../components/profile/SkillsSection';
import InterestsSection from '../../components/profile/InterestsSection';

// Form validation schema
const identitySchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be 500 characters or less'),
});

type IdentityFormData = z.infer<typeof identitySchema>;

/**
 * User Profile page component
 * Accessible via /u/id
 */
const UserProfile: FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isEditingIdentity, setIsEditingIdentity] = useState(false);
  const [isMentorshipDialogOpen, setIsMentorshipDialogOpen] = useState(false);
  const [newMentorshipStatus, setNewMentorshipStatus] = useState<
    'MENTOR' | 'MENTEE'
  >('MENTEE');

  // Function to handle smooth scroll
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Fetch user data
  const {
    data: fullProfile,
    isLoading: isLoadingUser,
    error: userError,
  } = useUserProfileById(parseInt(userId || ''));

  const { data: authUser, isLoading: isLoadingAuthUser } = useUserById(
    parseInt(userId || '')
  );

  // Update user profile mutation
  const updateUserProfile = useUpdateUserProfile(
    fullProfile?.profile.userId || 0
  );
  // Update auth user mutation
  const updateAuthUser = useUpdateUser(authUser?.id || 0);

  // Get the current user ID from local storage to check if the profile belongs to the current user
  const currentUserId = localStorage.getItem('id');
  const isOwnProfile =
    !!fullProfile &&
    !!currentUserId &&
    fullProfile.profile.userId === parseInt(currentUserId || '0');

  // Form for editing identity
  const {
    control: identityControl,
    handleSubmit: handleIdentitySubmit,
    reset: resetIdentity,
    formState: { errors: identityErrors },
  } = useForm<IdentityFormData>({
    resolver: zodResolver(identitySchema),
    defaultValues: {
      username: authUser?.username || '',
      email: authUser?.email || '',
      fullName: fullProfile?.profile.fullName || '',
      bio: fullProfile?.profile.bio || '',
    },
  });

  // Update form defaults when user data is loaded
  useEffect(() => {
    if (fullProfile) {
      resetIdentity({
        username: authUser?.username || '',
        email: authUser?.email || '',
        fullName: fullProfile.profile.fullName || '',
        bio: fullProfile.profile.bio || '',
      });
      setNewMentorshipStatus(authUser?.mentorshipStatus || 'MENTEE');
    }
  }, [fullProfile, resetIdentity, authUser]);

  // Handle identity form submission
  const onSubmitIdentity = async (data: IdentityFormData) => {
    if (!fullProfile) return;

    try {
      await updateUserProfile.mutateAsync({
        fullName: data.fullName,
        bio: data.bio,
      });
      await updateAuthUser.mutateAsync({
        id: authUser?.id || 0,
        username: data.username,
        email: data.email,
        userType: authUser?.userType || 'JOB_SEEKER',
        mentorshipStatus: newMentorshipStatus,
      });

      setIsEditingIdentity(false);
    } catch (error) {
      console.error('Failed to update identity:', error);
    }
  };

  // Cancel identity editing
  const cancelIdentityEdit = () => {
    resetIdentity({
      username: authUser?.username || '',
      email: authUser?.email || '',
      fullName: fullProfile?.profile.fullName || '',
      bio: fullProfile?.profile.bio || '',
    });
    setIsEditingIdentity(false);
    setIsMentorshipDialogOpen(false);
  };

  // Handle mentorship status change
  const handleMentorshipChange = async (newStatus: 'MENTOR' | 'MENTEE') => {
    if (!fullProfile) return;

    try {
      setNewMentorshipStatus(newStatus);
    } catch (error) {
      console.error('Failed to update mentorship status:', error);
    }
  };

  // Loading state
  if (isLoadingUser || isLoadingAuthUser) {
    return <CenteredLoader />;
  }

  // Error state
  if (userError || !fullProfile) {
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
      <Grid container spacing={3}>
        {/* Left Menu */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Paper
            elevation={3}
            sx={{
              position: 'sticky',
              top: 16,
              maxHeight: 'calc(100vh - 32px)',
              overflow: 'auto',
            }}
            component="nav"
          >
            <List>
              <ListItemButton onClick={() => scrollToSection('profile-info')}>
                <ListItemText primary="Profile Info" />
              </ListItemButton>
              <ListItemButton
                onClick={() => scrollToSection('work-experience')}
              >
                <ListItemText primary="Work Experience" />
              </ListItemButton>
              <Divider />
              <ListItemButton onClick={() => scrollToSection('education')}>
                <ListItemText primary="Education" />
              </ListItemButton>
              <Divider />
              <ListItemButton onClick={() => scrollToSection('badges')}>
                <ListItemText primary="Badges" />
              </ListItemButton>
              <Divider />
              <ListItemButton onClick={() => scrollToSection('skills')}>
                <ListItemText primary="Skills" />
              </ListItemButton>
              <Divider />
              <ListItemButton onClick={() => scrollToSection('interests')}>
                <ListItemText primary="Interests" />
              </ListItemButton>
            </List>
          </Paper>
        </Grid>

        {/* Main Content */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Profile Info */}
          <Paper elevation={3} sx={{ p: 3, mb: 4 }} id="profile-info">
            <Box
              display="flex"
              flexDirection={isMobile ? 'column' : 'row'}
              alignItems={isMobile ? 'center' : 'flex-start'}
              gap={4}
            >
              <ProfilePictureUpload
                userId={fullProfile.profile.userId}
                profilePictureUrl={fullProfile.profile.profilePicture}
                size={isMobile ? 100 : 150}
                editable={isOwnProfile}
              />

              {/* User info */}
              <Box flex={1}>
                {isEditingIdentity ? (
                  <form onSubmit={handleIdentitySubmit(onSubmitIdentity)}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="username"
                          control={identityControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Username"
                              error={!!identityErrors.username}
                              helperText={identityErrors.username?.message}
                              // disabled // read-only
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="email"
                          control={identityControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Email"
                              error={!!identityErrors.email}
                              helperText={identityErrors.email?.message}
                              // disabled // read-only
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="fullName"
                          control={identityControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Full Name"
                              error={!!identityErrors.fullName}
                              helperText={identityErrors.fullName?.message}
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Controller
                          name="bio"
                          control={identityControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              multiline
                              rows={4}
                              fullWidth
                              label="Bio"
                              error={!!identityErrors.bio}
                              helperText={
                                identityErrors.bio?.message ||
                                `${field.value.length}/500 characters`
                              }
                            />
                          )}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box display="flex" gap={1}>
                          <Button
                            variant="contained"
                            onClick={() => setIsMentorshipDialogOpen(true)}
                          >
                            Edit Mentorship Status
                          </Button>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
                              {newMentorshipStatus === 'MENTOR'
                                ? 'Mentor'
                                : 'Mentee'}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box display="flex" gap={1}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={updateUserProfile.isPending}
                          >
                            Save Changes
                          </Button>
                          <Button
                            onClick={cancelIdentityEdit}
                            variant="outlined"
                            startIcon={<CancelIcon />}
                          >
                            Cancel
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </form>
                ) : (
                  <>
                    {/* HEADER: name + handle on the left, edit button on the right */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Box display="flex" alignItems="center">
                        <Typography variant="h4">
                          {fullProfile.profile.fullName}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          {authUser?.username}
                        </Typography>
                      </Box>

                      {isOwnProfile && (
                        <Button
                          startIcon={<EditIcon />}
                          onClick={() => setIsEditingIdentity(true)}
                        >
                          Edit Profile
                        </Button>
                      )}
                    </Box>

                    {/* Email */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {authUser?.email}
                    </Typography>

                    {/* User type + mentor badge */}
                    <Box mt={1} mb={1}>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        gutterBottom
                      >
                        {authUser?.userType === 'EMPLOYER'
                          ? 'Employer'
                          : 'Job Seeker'}
                        {authUser?.mentorshipStatus === 'MENTOR' && ' • Mentor'}
                      </Typography>
                    </Box>

                    {/* Bio */}
                    <Box>
                      <Typography variant="body1" whiteSpace="pre-wrap">
                        {fullProfile.profile.bio || 'No bio added yet.'}
                      </Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Paper>

          {/* Work History Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }} id="work-experience">
            <WorkHistory
              userId={fullProfile.profile.userId}
              workHistory={fullProfile.experience}
              isEditable={isOwnProfile}
            />
          </Paper>

          {/* Education Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }} id="education">
            <EducationHistory
              userId={fullProfile.profile.userId}
              educationHistory={fullProfile.education}
              isEditable={isOwnProfile}
            />
          </Paper>

          {/* Badges Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }} id="badges">
            <BadgeDisplay badges={fullProfile.badges} />
          </Paper>

          {/* Skills Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }} id="skills">
            <SkillsSection
              userId={fullProfile.profile.userId}
              skills={fullProfile.profile.skills}
              isEditable={isOwnProfile}
            />
          </Paper>

          {/* Interests Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }} id="interests">
            <InterestsSection
              userId={fullProfile.profile.userId}
              interests={fullProfile.profile.interests}
              isEditable={isOwnProfile}
            />
          </Paper>

          {/* Mentorship Dialog */}
          <Dialog
            open={isMentorshipDialogOpen}
            onClose={() => setIsMentorshipDialogOpen(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle>Edit Mentorship Status</DialogTitle>
            <DialogContent>
              <Box sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  {['MENTOR', 'MENTEE'].map((opt) => (
                    <Grid size={{ xs: 12, sm: 6, md: 6 }} key={opt}>
                      <Card
                        sx={{
                          height: '100%',
                          border:
                            newMentorshipStatus === opt
                              ? `2px solid ${theme.palette.primary.main}`
                              : '1px solid rgba(0,0,0,0.12)',
                          bgcolor:
                            newMentorshipStatus === opt
                              ? theme.palette.mode === 'dark'
                                ? 'primary.900'
                                : 'primary.50'
                              : 'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: 3,
                          },
                        }}
                      >
                        <CardActionArea
                          onClick={() =>
                            handleMentorshipChange(opt as 'MENTOR' | 'MENTEE')
                          }
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            p: 2,
                          }}
                        >
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: '50%',
                              bgcolor:
                                newMentorshipStatus === opt
                                  ? 'primary.main'
                                  : 'action.hover',
                              color:
                                newMentorshipStatus === opt
                                  ? 'primary.contrastText'
                                  : 'text.primary',
                              mb: 2,
                            }}
                          >
                            {opt === 'MENTOR' ? (
                              <Person fontSize="large" />
                            ) : (
                              <Handshake fontSize="large" />
                            )}
                          </Box>
                          <CardContent sx={{ p: 1, textAlign: 'center' }}>
                            <Typography
                              variant="h6"
                              component="div"
                              gutterBottom
                              fontWeight="bold"
                            >
                              {opt === 'MENTOR' ? 'Mentor' : 'Mentee'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {opt === 'MENTOR'
                                ? 'Share your knowledge and help others grow in their career'
                                : 'Get guidance from experienced professionals in your field'}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setIsMentorshipDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => setIsMentorshipDialogOpen(false)}
              >
                Save
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserProfile;
