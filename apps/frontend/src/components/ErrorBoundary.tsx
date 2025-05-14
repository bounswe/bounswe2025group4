import { useRouteError, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

export default function ErrorBoundary() {
  const error = useRouteError();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container
      sx={{
        minHeight: '100vh',
        minWidth: '100vw',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        py: 8,
      }}
    >
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          bgcolor: theme.palette.background.paper,
          boxShadow: theme.shadows[4],
          maxWidth: 600,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '4rem',
            fontWeight: 'bold',
            color: theme.palette.error.main,
            mb: 2,
          }}
        >
          Oops!
        </Typography>
        <Typography
          variant="h5"
          sx={{ mb: 3, color: theme.palette.text.secondary }}
        >
          Something went wrong
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 4,
            p: 2,
            bgcolor: theme.palette.error.light,
            color: theme.palette.error.contrastText,
            borderRadius: 1,
          }}
        >
          {error instanceof Error ? error.message : 'An unknown error occurred'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          size="large"
          sx={{
            minWidth: 200,
            textTransform: 'none',
          }}
        >
          Return to Home
        </Button>
      </Box>
    </Container>
  );
}
