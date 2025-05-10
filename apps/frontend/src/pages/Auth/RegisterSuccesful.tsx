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
              ? '0 8px 32px rgba(0, 0, 0, 0.5)'
              : '0 8px 32px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box p={3} bgcolor="primary.main" color="primary.contrastText">
          <Typography variant="h4">Registration Successful</Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Paper>
    </Container>
  );
}
