import {
  Button,
  Container,
  Typography,
  Box,
  Paper,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function RegisterSuccesfull() {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={3}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.8)'
              : '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <Box p={3} bgcolor="primary.main" color="primary.contrastText">
          <Typography variant="h4">Registration Successful</Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to the platform!
          </Typography>
          <Typography variant="body1" gutterBottom>
            You can now login to your account and start using the platform.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'right', mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
