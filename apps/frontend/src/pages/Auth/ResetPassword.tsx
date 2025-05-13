import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  useTheme,
  Alert,
  AlertTitle,
  InputAdornment,
  IconButton,
  Fade,
  Snackbar,
} from '@mui/material';
import {
  Lock,
  Visibility,
  VisibilityOff,
  CheckCircleOutline,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useResetPassword } from '../../services/auth.service';

// New password schema
const newPasswordSchema = z
  .object({
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const theme = useTheme();
  const [resetComplete, setResetComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');
  const resetPasswordMutation = useResetPassword();

  // Form handling for new password step
  const passwordForm = useForm<z.infer<typeof newPasswordSchema>>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Handle new password submission
  const onSubmitNewPassword = (data: z.infer<typeof newPasswordSchema>) => {
    const sendData = {
      token: token || '',
      newPassword: data.password,
    };
    resetPasswordMutation.mutate(sendData, {
      onSuccess: () => {
        setResetComplete(true);
      },
      onError: (error) => {
        const errorMessage =
          error?.message || 'Failed to reset password. Please try again.';
        setError(errorMessage);
        setOpenSnackbar(true);
      },
    });
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
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
        <Box
          sx={{
            py: 3,
            px: 4,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
          }}
        >
          <Typography variant="h4" fontWeight="bold">
            Create New Password
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            {resetComplete
              ? 'Your password has been successfully reset'
              : 'Create a new secure password for your account'}
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {resetComplete ? (
            // Success state
            <Fade in={resetComplete}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleOutline
                  sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
                />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Password Reset Complete
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  Your password has been successfully updated. You can now use
                  your new password to log in to your account.
                </Typography>
                <Button
                  variant="contained"
                  href="/login" // Redirect to login page
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    borderRadius: 2,
                    fontSize: '1rem',
                    textTransform: 'none',
                    fontWeight: 'bold',
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Fade>
          ) : (
            // New password form
            <Box
              component="form"
              onSubmit={passwordForm.handleSubmit(onSubmitNewPassword)}
              sx={{ mt: 2 }}
            >
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Create New Password</AlertTitle>
                Please create a strong password that you haven't used before.
              </Alert>

              <Controller
                name="password"
                control={passwordForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showPassword ? 'text' : 'password'}
                    label="New Password"
                    fullWidth
                    margin="normal"
                    error={!!passwordForm.formState.errors.password}
                    helperText={passwordForm.formState.errors.password?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                            >
                              {showPassword ? (
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

              <Controller
                name="confirmPassword"
                control={passwordForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type={showConfirmPassword ? 'text' : 'password'}
                    label="Confirm New Password"
                    fullWidth
                    margin="normal"
                    error={!!passwordForm.formState.errors.confirmPassword}
                    helperText={
                      passwordForm.formState.errors.confirmPassword?.message
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Reset Password
              </Button>
            </Box>
          )}
        </Box>
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          onClose={handleCloseSnackbar}
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
