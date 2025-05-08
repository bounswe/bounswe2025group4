import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import { Box, Container } from '@mui/material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CenteredLoader from '../components/layout/CenterLoader';

export default function RootLayout() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: '100vw' }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 0, py: 3 }}>
        <Container maxWidth={false}>
          <Suspense fallback={<CenteredLoader />}>
            <Outlet />
          </Suspense>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
