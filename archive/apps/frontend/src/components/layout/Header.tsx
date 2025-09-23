import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  IconButton,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import { ThemeToggle } from '../common/ThemeToggle';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { token, setToken } = useAuth();

  const handleLogout = () => {
    setToken(null);
    window.location.href = '/';
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Box sx={{ flexGrow: 1, display: 'flex' }}>
            <IconButton component={RouterLink} to="/">
              <img src="/ethica-logo.svg" alt="Ethica Jobs" width={128} height={64} />
            </IconButton>
            <Button color="inherit" component={RouterLink} to="/jobs">
              Jobs
            </Button>
            <Button color="inherit" component={RouterLink} to="/mentorship">
              Mentorship
            </Button>
            <Button color="inherit" component={RouterLink} to="/forum">
              Forum
            </Button>
          </Box>

          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
            {token ? (
              <>
                <IconButton
                  data-testid="profile-button"
                  component={RouterLink}
                  to={`/profile`}
                  color="inherit"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                >
                  <AccountCircle />
                </IconButton>
                <IconButton
                  color="inherit"
                  onClick={handleLogout}
                  data-testid="logout-button"
                >
                  <Logout />
                </IconButton>
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
            <ThemeToggle />
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
