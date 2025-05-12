import { Container, Stack, Typography, Box } from '@mui/material';
import { DailyQuote } from '../components/DailyQuote';

export const HomePage = () => {
  return (
    <Container maxWidth="lg">
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} sx={{ mt: 4 }}>
        {/* Hero Section */}
        <Box flex={{ xs: '1', md: '2' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            Find Your Next Ethical Career Move
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Connect with employers who share your values and make a positive
            impact through your work.
          </Typography>
        </Box>

        {/* Quote Section */}
        <Box flex="1" sx={{ position: 'sticky', top: 24 }}>
          <DailyQuote />
        </Box>
      </Stack>
    </Container>
  );
};

export default HomePage;
