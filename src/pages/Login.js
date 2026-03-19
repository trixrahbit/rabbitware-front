// src/components/Login.js

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
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
  Tooltip,
  IconButton,
  Avatar
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Microsoft as MicrosoftIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useTheme } from '../contexts/ThemeContext';

// Ensure cookies (your session cookie) are sent on every request
axios.defaults.withCredentials = true;

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, loginWithM365 } = useAuth();
  const { settings } = useSettings();
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for session expiration message in location state
  useEffect(() => {
    if (location.state?.message) {
      setError(location.state.message);
      // Clear the message from location state to prevent it from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const siteName = settings?.general?.siteName || 'RabbitAI Admin';
  const logo = darkMode ? (settings?.branding?.darkLogo || settings?.branding?.logo || '/logo.png') : (settings?.branding?.logo || '/logo.png');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err.response?.data);

      // Check if the error has a structured format with message and errors
      if (err.response?.data?.message && err.response?.data?.errors) {
        // For structured errors (like "Email not verified"), show the specific error
        const errorMessages = err.response.data.errors;
        setError(errorMessages.join('. '));
      } else {
        // For simple string errors or when there's no response, use the detail or a fallback
        setError(err.response?.data?.detail || err.message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleM365Click = async () => {
    setError('');
    setLoading(true);
    try {
      // opens the popup, completes SSO, sets cookie + currentUser
      await loginWithM365();
      // now that cookie is present, navigate
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || 'Microsoft login failed');
    } finally {
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
        <Paper elevation={3} sx={{ p: 4, width: '100%', borderRadius: 2 }}>
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
          <Typography variant="h4" align="center" gutterBottom>
            {siteName}
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to access the admin dashboard
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enter your registered email address" arrow>
                      <IconButton edge="end" size="small" tabIndex={-1}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
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
                InputProps={{
                  endAdornment: (
                    <Tooltip title="Enter your password. Make sure Caps Lock is off." arrow>
                      <IconButton edge="end" size="small" tabIndex={-1}>
                        <HelpOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )
                }}
              />
            </Box>
            <Tooltip title="Sign in with your email and password" arrow>
              <span style={{ width: '100%' }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 3, mb: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
              </span>
            </Tooltip>
          </form>

          <Divider sx={{ my: 3 }}>OR</Divider>

          <Tooltip title="Use your Microsoft 365 account to sign in securely" arrow>
            <span style={{ width: '100%' }}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<MicrosoftIcon />}
                onClick={handleM365Click}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Sign in with Microsoft 365'}
              </Button>
            </span>
          </Tooltip>
        </Paper>
      </Box>
    </Container>
  );
}
