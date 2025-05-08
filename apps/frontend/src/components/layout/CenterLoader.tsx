import { Box, CircularProgress } from '@mui/material';

export default function CenteredLoader() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
    >
      <CircularProgress />
    </Box>
  );
}
