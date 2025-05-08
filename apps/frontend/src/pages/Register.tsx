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
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  GitHub,
  Google,
  LinkedIn,
  Work,
  School,
  Person,
  Handshake,
  DoNotDisturb,
  ArrowBack,
  ArrowForward,
} from '@mui/icons-material';

// Define user type options
type UserType = 'jobSeeker' | 'employer' | 'mentor' | 'mentee' | 'notInterested';

interface UserTypeOption {
  value: UserType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const userTypeOptions: UserTypeOption[] = [
  {
    value: 'jobSeeker',
    label: 'Job Seeker',
    icon: <Work fontSize="large" />,
    description: 'Find your dream job with personalized recommendations',
  },
  {
    value: 'employer',
    label: 'Employer',
    icon: <School fontSize="large" />,
    description: 'Post jobs and find the perfect candidates for your team',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    icon: <Person fontSize="large" />,
    description: 'Share your knowledge and help others grow in their career',
  },
  {
    value: 'mentee',
    label: 'Mentee',
    icon: <Handshake fontSize="large" />,
    description: 'Get guidance from experienced professionals in your field',
  },
  {
    value: 'notInterested',
    label: 'Not Interested',
    icon: <DoNotDisturb fontSize="large" />,
    description: 'Skip categorization for now (you can set this later)',
  },
];

// Define form schema with Zod
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
  confirmPassword: z.string(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState<'credentials' | 'userType'>('credentials');
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: undefined,
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    // In a real app, you would submit both the form data and the selected user type
    console.log('Form data:', data);
    console.log('User type:', selectedUserType);
    // Proceed to the user type selection step
    setCurrentStep('userType');
  };

  const handleUserTypeSelect = (userType: UserType) => {
    setSelectedUserType(userType);
    // In a real app, you would finalize registration here with both form data and user type
    // For demo purposes, we'll just log the selection
    console.log(`Selected user type: ${userType}`);
  };

  const handleCompleteRegistration = () => {
    // In a real app, you would make the final API call here
    alert(`Registration complete! User type: ${selectedUserType}`);
    // Redirect to login or dashboard
    window.location.href = '/login';
  };

  const handleBack = () => {
    setCurrentStep('credentials');
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 2, 
          overflow: 'hidden',
          boxShadow: theme.palette.mode === 'dark' 
            ? '0 8px 32px rgba(0, 0, 0, 0.5)' 
            : '0 8px 32px rgba(0, 0, 0, 0.1)'
        }}
      >
        <Box sx={{ 
          py: 3, 
          px: 4, 
          bgcolor: 'primary.main', 
          color: 'primary.contrastText',
          position: 'relative'
        }}>
          <Typography variant="h4" fontWeight="bold">
            {currentStep === 'credentials' ? 'Create your account' : 'Choose your role'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            {currentStep === 'credentials' 
              ? 'Join our platform to connect with opportunities'
              : 'Help us personalize your experience'
            }
          </Typography>
        </Box>

        {currentStep === 'credentials' ? (
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid size= {{xs: 12, sm: 6}}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="First Name"
                      fullWidth
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size= {{xs: 12, sm: 6}}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Name"
                      fullWidth
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size= {{xs: 12}}>
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
              <Grid size= {{xs: 12}}>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size= {{xs: 12}}>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type={showConfirmPassword ? 'text' : 'password'}
                      label="Confirm Password"
                      fullWidth
                      error={!!errors.confirmPassword}
                      helperText={errors.confirmPassword?.message}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid size= {{xs: 12}}>
                <Controller
                  name="agreeToTerms"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          {...field}
                          checked={field.value}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2">
                          I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
                        </Typography>
                      }
                    />
                  )}
                />
                {errors.agreeToTerms && (
                  <Typography color="error" variant="caption" sx={{ display: 'block', ml: 2 }}>
                    {errors.agreeToTerms.message}
                  </Typography>
                )}
              </Grid>
              <Grid size= {{xs: 12}}>
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
                    fontWeight: 'bold'
                  }}
                  endIcon={<ArrowForward />}
                >
                  Continue
                </Button>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 4 }}>
              <Typography variant="body2" color="text.secondary">
                OR SIGN UP WITH
              </Typography>
            </Divider>

            <Grid container spacing={2}>
              <Grid size= {{xs: 12, sm: 4}}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<Google />}
                  sx={{ py: 1, textTransform: 'none' }}
                >
                  Google
                </Button>
              </Grid>
              <Grid size= {{xs: 12, sm: 4}}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GitHub />}
                  sx={{ py: 1, textTransform: 'none' }}
                >
                  GitHub
                </Button>
              </Grid>
              <Grid size= {{xs: 12, sm: 4}}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LinkedIn />}
                  sx={{ py: 1, textTransform: 'none' }}
                >
                  LinkedIn
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="body2">
                Already have an account? <a href="/login">Sign in</a>
              </Typography>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
              Select your primary purpose for joining:
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {userTypeOptions.map((option) => (
                <Grid size= {{xs: 12, sm: 6, md: 4}} key={option.value}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      border: selectedUserType === option.value ? 
                        `2px solid ${theme.palette.primary.main}` : 
                        '1px solid rgba(0,0,0,0.12)',
                      bgcolor: selectedUserType === option.value ?
                        (theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50') :
                        'background.paper',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 3
                      }
                    }}
                  >
                    <CardActionArea 
                      onClick={() => handleUserTypeSelect(option.value)}
                      sx={{ 
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        p: 2
                      }}
                    >
                      <Box 
                        sx={{ 
                          p: 2, 
                          borderRadius: '50%', 
                          bgcolor: selectedUserType === option.value ? 
                            'primary.main' : 'action.hover',
                          color: selectedUserType === option.value ?
                            'primary.contrastText' : 'text.primary',
                          mb: 2
                        }}
                      >
                        {option.icon}
                      </Box>
                      <CardContent sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="h6" component="div" gutterBottom fontWeight="bold">
                          {option.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.description}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBack />}
                sx={{ textTransform: 'none' }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                disabled={!selectedUserType}
                onClick={handleCompleteRegistration}
                endIcon={<ArrowForward />}
                sx={{ 
                  py: 1.5, 
                  px: 4,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  ml: 'auto'
                }}
              >
                Complete Registration
              </Button>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
}