import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Link,
  Avatar,
} from '@mui/material';
import { Login as LoginIcon, PersonAdd as RegisterIcon } from '@mui/icons-material';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

const Landing = () => {
  const { settings } = useSettings();
  const { darkMode } = useTheme();

  const siteName = settings?.general?.siteName || 'RabbitAI';
  const companyName = settings?.general?.companyName || 'Your Company';
  const logo = darkMode ? (settings?.branding?.darkLogo || settings?.branding?.logo || '/logo.png') : (settings?.branding?.logo || '/logo.png');

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          py: 4,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
            textAlign: 'center',
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={logo} 
              alt={siteName}
              sx={{ 
                width: 100, 
                height: 100, 
                mb: 2,
                borderRadius: 1
              }}
              variant="square"
            />
          </Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to {siteName}
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Your intelligent assistant for managing support tickets and improving productivity
          </Typography>

          <Box sx={{ mt: 4, mb: 6 }}>
            <Typography variant="body1" paragraph>
              {siteName} helps you manage support tickets, automate responses, and improve your team's productivity.
              Sign in to your account or register to get started.
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} sm={6} md={5}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    Already have an account?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Sign in to access your dashboard and continue your work.
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<LoginIcon />}
                  sx={{ mt: 2 }}
                >
                  Sign In
                </Button>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={5}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="h5" component="h2" gutterBottom>
                    New to {siteName}?
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Create an account to start managing your support tickets efficiently.
                  </Typography>
                </Box>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<RegisterIcon />}
                  sx={{ mt: 2 }}
                >
                  Register
                </Button>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 6 }}>
            <Typography variant="body2" color="text.secondary">
              By using this service, you agree to our{' '}
              <Link href="#" color="primary">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" color="primary">
                Privacy Policy
              </Link>
              .
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Landing;
