import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Button,
  Container,
  Link,
  Paper,
  TextField,
  Typography,
  useTheme,
  Alert,
  AlertTitle,
  InputAdornment,
  Fade,
  Snackbar,
} from '@mui/material';
import { ArrowForward, Email, CheckCircleOutline } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPassword } from '../../services/auth.service';

// Email submission schema
const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPasswordPage() {
  const theme = useTheme();
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  // Form handling for email step
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Handle email form submission
  const onSubmitEmail = (data: z.infer<typeof emailSchema>) => {
    setSubmittedEmail(data.email);
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setEmailSent(true);
      },
      onError: (error) => {
        const errorMessage =
          error?.message ||
          'Failed to send reset password email. Please try again.';
        setError(errorMessage);
        setOpenSnackbar(true);
      },
    });
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
            Forgot Password
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
            {emailSent
              ? 'Check your email for a reset link'
              : 'Enter your email to receive a password reset link'}
          </Typography>
        </Box>

        <Box sx={{ p: 4 }}>
          {emailSent ? (
            // Confirmation state
            <Fade in={emailSent}>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircleOutline
                  sx={{ fontSize: 64, color: 'success.main', mb: 2 }}
                />
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  Reset Link Sent
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4 }}
                >
                  If an account exists for <strong>{submittedEmail}</strong>,
                  you will receive an email with instructions on how to reset
                  your password. Please check your inbox and spam folder.
                </Typography>
                <Button
                  variant="contained"
                  href="/login"
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
                  Back to Log In
                </Button>
              </Box>
            </Fade>
          ) : (
            // Email input form
            <Box
              component="form"
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
              sx={{ mt: 2 }}
            >
              <Alert severity="info" sx={{ mb: 3 }}>
                <AlertTitle>Information</AlertTitle>
                Enter the email address associated with your account, and we'll
                send you a link to reset your password.
              </Alert>

              <Controller
                name="email"
                control={emailForm.control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    fullWidth
                    margin="normal"
                    error={!!emailForm.formState.errors.email}
                    helperText={emailForm.formState.errors.email?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  mt: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontSize: '1rem',
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                Send Reset Link
              </Button>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2">
                  Remember your password?{' '}
                  <Link component={RouterLink} to="/login">
                    Log in
                  </Link>
                </Typography>
              </Box>
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
          onClose={handleCloseSnackbar}
          severity="error"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
}
