import { Box, CircularProgress } from '@mui/material';

export default function CenteredLoader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%', // use parent height, not 100vh
        width: '100%',
        minHeight: '300px'
      }}
    >
      <CircularProgress />
    </Box>
  );
}
