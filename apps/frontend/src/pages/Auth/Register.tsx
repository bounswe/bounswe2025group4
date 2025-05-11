import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Work,
  // School,
  Person,
  Handshake,
  // DoNotDisturb,
  ArrowBack,
  ArrowForward,
  Hail,
} from '@mui/icons-material';
import { UserType, MentorshipRole } from '../../types/auth';
import { useNavigate } from 'react-router-dom';
import { useRegister } from '../../services/auth.service';

interface UserTypeOption {
  value: UserType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface MentorshipRoleOption {
  value: MentorshipRole;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const userTypeOptions: UserTypeOption[] = [
  {
    value: 'JOB_SEEKER',
    label: 'Job Seeker',
    icon: <Hail fontSize="large" />,
    description: 'Find your dream job with personalized recommendations',
  },
  {
    value: 'EMPLOYER',
    label: 'Employer',
    icon: <Work fontSize="large" />,
    description: 'Post jobs and find the perfect candidates for your team',
  },
];

const mentorshipRoleOptions: MentorshipRoleOption[] = [
  {
    value: 'MENTOR',
    label: 'Mentor',
    icon: <Person fontSize="large" />,
    description: 'Share your knowledge and help others grow in their career',
  },
  {
    value: 'MENTEE',
    label: 'Mentee',
    icon: <Handshake fontSize="large" />,
    description: 'Get guidance from experienced professionals in your field',
  },
];

// Define form schema with Zod
const registerSchema = z
  .object({
    // firstName: z.string().min(2, 'First name must be at least 2 characters'),
    // lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must include at least one special character'
      ),
    // this should be the same as the passwords
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({
        message: 'You must agree to the terms and conditions',
      }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<
    'credentials' | 'userType' | 'mentorship'
  >('credentials');

  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: true,
  });
  const [selectedUserType, setSelectedUserType] =
    useState<UserType>('JOB_SEEKER');
  const [selectedMentorshipRole, setSelectedMentorshipRole] =
    useState<MentorshipRole>('MENTEE');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      // firstName: '',
      // lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: undefined,
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    setFormData(data);
    setCurrentStep('userType');
  };

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
  };

  const handleMentorshipRoleSelect = (mentorshipRole: MentorshipRole) => {
    setSelectedMentorshipRole(mentorshipRole);
  };

  const handleCompleteRegistration = () => {
    // API call to complete registration
    const registerCredentials = {
      ...formData,
      bio: '',
      userType: selectedUserType,
      mentorshipRole: selectedMentorshipRole,
    };
    registerMutation.mutate(registerCredentials, {
      onSuccess: () => {
        navigate('/register-successfull');
      },
      onError: (error) => {
        const errorMessage = error?.message || 'An unexpected error occurred.';
        setRegistrationError(errorMessage);
        console.error(error);
      },
    });
  };

  const handleBack = () => {
    setCurrentStep(currentStep === 'userType' ? 'credentials' : 'userType');
  };

  const handleNext = () => {
    setCurrentStep(currentStep === 'userType' ? 'mentorship' : 'userType');
  };

  const renderCredidentals = () => (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 5 }}>
      <Grid container spacing={3}>
        {/* {(['firstName', 'lastName'] as (keyof RegisterFormData)[]).map(
          (field, idx) => (
            <Grid size={{ xs: 12, sm: 6 }} key={field}>
              <Controller
                name={field as keyof RegisterFormData}
                control={control}
                render={({ field: controllerField }) => (
                  <TextField
                    {...controllerField}
                    label={idx === 0 ? 'First Name' : 'Last Name'}
                    fullWidth
                    error={!!errors[field]}
                    helperText={errors[field]?.message}
                  />
                )}
              />
            </Grid>
          )
        )} */}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Username"
                fullWidth
                error={!!errors.username}
                helperText={errors.username?.message}
              />
            )}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Email Address"
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
        </Grid>
        {(['password', 'confirmPassword'] as (keyof RegisterFormData)[]).map(
          (field, idx) => (
            <Grid size={{ xs: 12 }} key={field}>
              <Controller
                name={field as keyof RegisterFormData}
                control={control}
                render={({ field: controllerField }) => (
                  <TextField
                    {...controllerField}
                    type={
                      idx === 0
                        ? showPassword
                          ? 'text'
                          : 'password'
                        : 'password'
                    }
                    label={idx === 0 ? 'Password' : 'Confirm Password'}
                    fullWidth
                    error={!!errors[field]}
                    helperText={errors[field]?.message}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                idx === 0
                                  ? setShowPassword(!showPassword)
                                  : setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge="end"
                            >
                              {idx === 0 ? (
                                showPassword ? (
                                  <VisibilityOff />
                                ) : (
                                  <Visibility />
                                )
                              ) : showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </Grid>
          )
        )}
        <Grid size={{ xs: 12 }}>
          <Controller
            name="agreeToTerms"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    {...field}
                    checked={field.value as boolean}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the <a href="#terms">Terms of Service</a> and{' '}
                    <a href="#privacy">Privacy Policy</a>
                  </Typography>
                }
              />
            )}
          />
          {errors.agreeToTerms && (
            <Typography
              color="error"
              variant="caption"
              sx={{ display: 'block', ml: 2 }}
            >
              {errors.agreeToTerms.message}
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: 'bold',
            }}
            endIcon={<ArrowForward />}
          >
            Continue
          </Button>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="body2">
          Already have an account? <a href="/login">Sign in</a>
        </Typography>
      </Box>
    </Box>
  );

  const renderSelection = (
    title: string,
    subtitle: string,
    options: {
      value: string;
      label: string;
      icon: React.ReactNode;
      description: string;
    }[],
    selected: string | null,
    onSelect: (val: string) => void
  ) => (
    <Box p={4}>
      <Typography variant="h6">{title}</Typography>
      <Typography variant="body2" mb={2}>
        {subtitle}
      </Typography>
      <Grid container spacing={2}>
        {options.map((opt) => (
          <Grid
            size={{ xs: 12, sm: 6, md: options.length === 2 ? 6 : 4 }}
            key={opt.value}
          >
            <Card
              sx={{
                height: '100%',
                border:
                  selected === opt.value
                    ? `2px solid ${theme.palette.primary.main}`
                    : '1px solid rgba(0,0,0,0.12)',
                bgcolor:
                  selected === opt.value
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
                onClick={() => onSelect(opt.value)}
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
                      selected === opt.value ? 'primary.main' : 'action.hover',
                    color:
                      selected === opt.value
                        ? 'primary.contrastText'
                        : 'text.primary',
                    mb: 2,
                  }}
                >
                  {opt.icon}
                </Box>
                <CardContent sx={{ p: 1, textAlign: 'center' }}>
                  <Typography
                    variant="h6"
                    component="div"
                    gutterBottom
                    fontWeight="bold"
                  >
                    {opt.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {opt.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack direction="row" spacing={2} mt={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ textTransform: 'none' }}
        >
          Back
        </Button>
        {currentStep === 'userType' && (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
            disabled={!selected}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: 'bold',
              ml: 'auto',
              flexGrow: 1,
            }}
          >
            Continue
          </Button>
        )}
        {currentStep === 'mentorship' && (
          <Button
            variant="contained"
            disabled={!selectedMentorshipRole}
            onClick={handleCompleteRegistration}
            endIcon={<ArrowForward />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1rem',
              textTransform: 'none',
              fontWeight: 'bold',
              ml: 'auto',
              flexGrow: 1,
            }}
          >
            Complete Registration
          </Button>
        )}
      </Stack>
      {registrationError && currentStep === 'mentorship' && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {registrationError}
        </Alert>
      )}
    </Box>
  );

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box p={3} bgcolor="primary.main" color="primary.contrastText">
          <Typography variant="h4">
            {currentStep === 'credentials'
              ? 'Create your account'
              : currentStep === 'userType'
                ? 'Choose your role'
                : 'Choose mentorship role'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            {currentStep === 'credentials'
              ? 'Join our platform to connect with opportunities'
              : 'Help us personalize your experience'}
          </Typography>
        </Box>
        {currentStep === 'credentials' && renderCredidentals()}
        {currentStep === 'userType' &&
          renderSelection(
            'Select your primary purpose',
            'Are you offering or seeking job opportunities?',
            userTypeOptions,
            selectedUserType,
            (val: string) => handleUserTypeSelect(val as UserType)
          )}
        {currentStep === 'mentorship' &&
          renderSelection(
            'Select your mentorship role',
            'Are you seeking guidance or offering help?',
            mentorshipRoleOptions,
            selectedMentorshipRole,
            (val: string) => handleMentorshipRoleSelect(val as MentorshipRole)
          )}
      </Paper>
    </Container>
  );
}
