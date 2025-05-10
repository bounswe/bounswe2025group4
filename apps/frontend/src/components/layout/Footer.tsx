import * as React from 'react';
import { Box, Container, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3, // Padding top/bottom
        px: 2, // Padding left/right
        mt: 'auto', // Push footer to bottom of flex container
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" align="center">
          {'Copyright © '}
          {/* TODO: Replace with actual link/name if needed */}
          <Link color="inherit" href="/">
            Job Listing Platform
          </Link>{' '}
          {new Date().getFullYear()}
          {'.'}
        </Typography>
        {/* TODO: Add other footer links (e.g., Privacy Policy, Terms) if needed */}
      </Container>
    </Box>
  );
};

export default Footer;
