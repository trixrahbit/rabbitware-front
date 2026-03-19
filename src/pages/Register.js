import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Divider, 
  Alert,
  CircularProgress,
  Link,
  Tooltip,
  IconButton,
  Avatar
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Microsoft as MicrosoftIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithM365, error: authError } = useAuth();
  const { settings } = useSettings();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  const siteName = settings?.general?.siteName || 'RabbitAI';
  const logo = darkMode ? (settings?.branding?.darkLogo || settings?.branding?.logo || '/logo.png') : (settings?.branding?.logo || '/logo.png');

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password strength validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

    if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setError('');
      setLoading(true);

      // Use the register function from AuthContext
      await register(name, email, password);

      // Navigate to the dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);

      // Error is already handled by the AuthContext
      // but we can set a local error message if needed
      if (!authError) {
        setError('Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleM365Register = async () => {
    try {
      setError('');
      setLoading(true);

      // Use the same Microsoft 365 login flow as the login page
      const user = await loginWithM365();

      // Navigate to the dashboard on successful login
      navigate('/dashboard');
    } catch (err) {
      console.error('Error in Microsoft 365 registration:', err);

      // Extract detailed error message
      let errorMessage = 'Failed to register with Microsoft 365';

      if (err.response) {
        console.error('Error response data:', err.response.data);
        console.error('Error response status:', err.response.status);

        // Use the detailed error message from the server if available
        if (err.response.data && err.response.data.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
            <Avatar 
              src={logo} 
              alt={siteName}
              sx={{ 
                width: 80, 
                height: 80, 
                mb: 2,
                borderRadius: 1
              }}
              variant="square"
            />
          </Box>
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create an Account
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Register to access {siteName}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Full Name"
                type="text"
                fullWidth
                margin="normal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enter your full name as it will appear in the system" arrow placement="top">
                      <IconButton edge="end" size="small" tabIndex={-1}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enter a valid email address. This will be used for login and communications." arrow placement="top">
                      <IconButton edge="end" size="small" tabIndex={-1}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                helperText="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Create a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters" arrow placement="top">
                      <IconButton edge="end" size="small" tabIndex={-1}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Confirm Password"
                type="password"
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Re-enter your password to confirm it matches" arrow placement="top">
                      <IconButton edge="end" size="small" tabIndex={-1}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ),
                }}
              />
            </Box>
            <Tooltip title="Create a new account with your email and password" arrow placement="top">
              <span style={{ width: '100%' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Register'}
                </Button>
              </span>
            </Tooltip>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Tooltip title="Create a new account using your Microsoft 365 credentials" arrow placement="top">
            <span style={{ width: '100%' }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<MicrosoftIcon />}
                onClick={handleM365Register}
                disabled={loading}
              >
                Register with Microsoft 365
              </Button>
            </span>
          </Tooltip>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Tooltip title="Go to the login page if you already have an account" arrow placement="top">
                <Link component={RouterLink} to="/login" color="primary">
                  Sign in
                </Link>
              </Tooltip>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
