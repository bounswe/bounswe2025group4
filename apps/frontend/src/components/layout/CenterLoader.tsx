import { Box, CircularProgress } from '@mui/material';

export default function CenteredLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '80vh',
        width: '100vw',
      }}
    >
      <CircularProgress />
    </Box>
  );
}
