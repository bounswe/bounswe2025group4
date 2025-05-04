import * as React from 'react';
import { AppBar, Toolbar, Button, Box, Container } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ThemeToggle } from '../common/ThemeToggle';
// Placeholder for AuthContext/Store to determine auth status
// import { useAuth } from '../../context/AuthContext';

// Placeholder type for user - replace with actual type from auth context
interface UserPlaceholder {
  username?: string;
}

const Header: React.FC = () => {
  // const { isAuthenticated, user } = useAuth(); // Example usage

  // Placeholder logic - replace with actual auth state from context/store
  const isAuthenticated = false;
  const user: UserPlaceholder | null = null; // Use the placeholder type

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            {/* TODO: Add Logo */}
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            <Button color="inherit" component={RouterLink} to="/jobs">
              Jobs
            </Button>
            <Button color="inherit" component={RouterLink} to="/mentorship">
              Mentorship
            </Button>
            <Button color="inherit" component={RouterLink} to="/forum">
              Forum
            </Button>
            {/* TODO: Add Employer Dashboard link if user is an employer */}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                {/* TODO: Replace with actual username and link */}
                <Button
                  color="inherit"
                  component={RouterLink}
                  to={`/u/${user?.username ?? 'profile'}`}
                >
                  Profile
                </Button>
                {/* TODO: Implement Logout functionality */}
                <Button
                  color="inherit"
                  onClick={() => console.log('Logout clicked')}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={RouterLink} to="/login">
                  Login
                </Button>
                <Button color="inherit" component={RouterLink} to="/register">
                  Register
                </Button>
              </>
            )}
            {
              <ThemeToggle />
            }
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
