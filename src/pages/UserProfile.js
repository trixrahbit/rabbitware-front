import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Divider,
  Paper,
  FormControlLabel,
  Switch,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  PhotoCamera as PhotoCameraIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';

export default function UserProfile() {
  const { currentUser, updateSessionTimeout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const daysOfWeekOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  const parseWorkingHours = (wh) => {
    if (!wh) return { daysOfWeek: [], startTime: '', endTime: '' };
    if (typeof wh === 'object') {
      return {
        daysOfWeek: wh.daysOfWeek || [],
        startTime: wh.startTime || '',
        endTime: wh.endTime || ''
      };
    }
    try {
      const obj = JSON.parse(wh);
      return {
        daysOfWeek: obj.daysOfWeek || [],
        startTime: obj.startTime || '',
        endTime: obj.endTime || ''
      };
    } catch {
      return { daysOfWeek: [], startTime: '', endTime: '' };
    }
  };
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState(60);
  const [checkedIn, setCheckedIn] = useState(false);
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    phone: '',
    location: '',
    working_hours: {
      daysOfWeek: [],
      startTime: '',
      endTime: ''
    },
    timezone: 'UTC',
    bio: '',
    profile_picture_url: null
  });

  useEffect(() => {
    fetchUserProfile();

    // Set session timeout from currentUser if available
    if (currentUser && currentUser.session_timeout) {
      setSessionTimeout(currentUser.session_timeout);
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // First try to fetch from the UserProfile API
      try {
        const profileResponse = await axios.get(`/api/user_profiles/${currentUser.id}`);

        if (profileResponse.data) {
          const wh = parseWorkingHours(profileResponse.data.working_hours);
          setProfileData({
            first_name: profileResponse.data.first_name || '',
            last_name: profileResponse.data.last_name || '',
            email: profileResponse.data.email || currentUser.email || '',
            role: profileResponse.data.role || currentUser.role || '',
            phone: profileResponse.data.phone || '',
            location: profileResponse.data.location || '',
            working_hours: wh,
            timezone: profileResponse.data.timezone || 'UTC',
            bio: profileResponse.data.bio || '',
            profile_picture_url: profileResponse.data.profile_picture_url || null
          });
          setCheckedIn(!!profileResponse.data.checked_in);
          setLoading(false);
          return;
        }
      } catch (profileError) {
        console.log('UserProfile not found, falling back to user data');
      }

      // If UserProfile not found, try the user API
      const response = await axios.get('/api/auth/users/me');

      // If we have data from the API, use it
      if (response.data) {
        const wh = parseWorkingHours(response.data.working_hours);
        // Split name into first_name and last_name if available
        let firstName = '';
        let lastName = '';
        if (response.data.name) {
          const nameParts = response.data.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        setProfileData({
          first_name: response.data.first_name || firstName,
          last_name: response.data.last_name || lastName,
          email: response.data.email || '',
          role: response.data.role || '',
          phone: response.data.phone || '',
          location: response.data.location || '',
          working_hours: wh,
          timezone: response.data.timezone || response.data.time_zone || 'UTC',
          bio: response.data.bio || '',
          profile_picture_url: response.data.profile_picture_url || response.data.profilePicture || null
        });
        setCheckedIn(!!response.data.checked_in);
      }
      // Otherwise, use data from the auth context
      else if (currentUser) {
        const wh = parseWorkingHours(currentUser.working_hours);
        // Split name into first_name and last_name if available
        let firstName = '';
        let lastName = '';
        if (currentUser.name) {
          const nameParts = currentUser.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        setProfileData({
          first_name: currentUser.first_name || firstName,
          last_name: currentUser.last_name || lastName,
          email: currentUser.email || '',
          role: currentUser.role || '',
          phone: '',
          location: '',
          working_hours: wh,
          timezone: currentUser.timezone || currentUser.time_zone || 'UTC',
          bio: '',
          profile_picture_url: currentUser.profile_picture_url || currentUser.picture || null
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data. Please try again.');
      setLoading(false);

      // If API fails, still try to use data from auth context
      if (currentUser) {
        const wh = parseWorkingHours(currentUser.working_hours);
        // Split name into first_name and last_name if available
        let firstName = '';
        let lastName = '';
        if (currentUser.name) {
          const nameParts = currentUser.name.split(' ');
          firstName = nameParts[0] || '';
          lastName = nameParts.slice(1).join(' ') || '';
        }

        setProfileData({
          first_name: currentUser.first_name || firstName,
          last_name: currentUser.last_name || lastName,
          email: currentUser.email || '',
          role: currentUser.role || '',
          phone: '',
          location: '',
          working_hours: wh,
          timezone: currentUser.timezone || currentUser.time_zone || 'UTC',
          bio: '',
          profile_picture_url: currentUser.profile_picture_url || currentUser.picture || null
        });
        setCheckedIn(!!currentUser.checked_in);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleWorkingHoursChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      working_hours: {
        ...prev.working_hours,
        [field]: value
      }
    }));
  };

  const handleTimeZoneChange = (e) => {
    const { value } = e.target;
    setProfileData(prev => ({
      ...prev,
      timezone: value
    }));
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();

      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profile_picture_url: reader.result
        }));
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Prepare payload with working_hours as JSON string
      const payload = {
        ...profileData,
        user_id: currentUser.id,
        working_hours: JSON.stringify(profileData.working_hours)
      };

      try {
        // First try to update existing profile
        await axios.put(`/api/user_profiles/${currentUser.id}`, payload);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // If profile doesn't exist, create a new one
          await axios.post('/api/user_profiles', payload);
        } else {
          // For other errors, rethrow
          throw error;
        }
      }

      setSuccess(true);
      setSaving(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('Failed to save profile. Please try again.');
      setSaving(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccess(false);
    setError('');
  };

  const handleSessionTimeoutChange = async (e) => {
    const value = parseInt(e.target.value);
    if (isNaN(value) || value < 1) {
      setError('Session timeout must be at least 1 minute');
      return;
    }

    try {
      setSessionTimeout(value);
      await updateSessionTimeout(value);
      setSuccess(true);
    } catch (error) {
      setError('Failed to update session timeout. Please try again.');
    }
  };

  const handleCheckIn = async () => {
    try {
      await axios.post('/api/auth/check-in');
      setCheckedIn(true);
    } catch (err) {
      setError('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await axios.post('/api/auth/check-out');
      setCheckedIn(false);
    } catch (err) {
      setError('Failed to check out');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        User Profile
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="first_name"
                  value={profileData.first_name}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="last_name"
                  value={profileData.last_name}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="location-label">Location</InputLabel>
                  <Select
                    labelId="location-label"
                    name="location"
                    value={profileData.location || ''}
                    label="Location"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="">Select a location</MenuItem>
                    <MenuItem value="New York">New York</MenuItem>
                    <MenuItem value="Los Angeles">Los Angeles</MenuItem>
                    <MenuItem value="Chicago">Chicago</MenuItem>
                    <MenuItem value="Houston">Houston</MenuItem>
                    <MenuItem value="Phoenix">Phoenix</MenuItem>
                    <MenuItem value="Philadelphia">Philadelphia</MenuItem>
                    <MenuItem value="San Antonio">San Antonio</MenuItem>
                    <MenuItem value="San Diego">San Diego</MenuItem>
                    <MenuItem value="Dallas">Dallas</MenuItem>
                    <MenuItem value="San Jose">San Jose</MenuItem>
                    <MenuItem value="Remote">Remote</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="days-label">Days of Week</InputLabel>
                  <Select
                    labelId="days-label"
                    multiple
                    value={profileData.working_hours.daysOfWeek}
                    onChange={(e) => handleWorkingHoursChange('daysOfWeek', e.target.value)}
                    renderValue={(selected) => selected.join(', ')}
                  >
                    {daysOfWeekOptions.map((day) => (
                      <MenuItem key={day} value={day}>
                        <Checkbox checked={profileData.working_hours.daysOfWeek.indexOf(day) > -1} />
                        <ListItemText primary={day} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Start Time"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={profileData.working_hours.startTime}
                  onChange={(e) => handleWorkingHoursChange('startTime', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="End Time"
                  type="time"
                  InputLabelProps={{ shrink: true }}
                  value={profileData.working_hours.endTime}
                  onChange={(e) => handleWorkingHoursChange('endTime', e.target.value)}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="tz-label">Time Zone</InputLabel>
                  <Select
                    labelId="tz-label"
                    value={profileData.timezone}
                    label="Time Zone"
                    onChange={handleTimeZoneChange}
                  >
                    <MenuItem value="UTC">UTC</MenuItem>
                    <MenuItem value="America/New_York">Eastern Time (ET)</MenuItem>
                    <MenuItem value="America/Chicago">Central Time (CT)</MenuItem>
                    <MenuItem value="America/Denver">Mountain Time (MT)</MenuItem>
                    <MenuItem value="America/Los_Angeles">Pacific Time (PT)</MenuItem>
                    <MenuItem value="America/Anchorage">Alaska Time</MenuItem>
                    <MenuItem value="America/Honolulu">Hawaii Time</MenuItem>
                    <MenuItem value="America/Phoenix">Arizona</MenuItem>
                    <MenuItem value="Europe/London">London</MenuItem>
                    <MenuItem value="Europe/Paris">Paris</MenuItem>
                    <MenuItem value="Europe/Berlin">Berlin</MenuItem>
                    <MenuItem value="Europe/Moscow">Moscow</MenuItem>
                    <MenuItem value="Asia/Tokyo">Tokyo</MenuItem>
                    <MenuItem value="Asia/Shanghai">Shanghai</MenuItem>
                    <MenuItem value="Asia/Kolkata">India</MenuItem>
                    <MenuItem value="Australia/Sydney">Sydney</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Role"
                  name="role"
                  value={profileData.role}
                  margin="normal"
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  margin="normal"
                  multiline
                  rows={4}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Profile Picture and Preferences */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar 
              src={profileData.profile_picture_url} 
              alt={`${profileData.first_name} ${profileData.last_name}`}
              sx={{ width: 120, height: 120, mb: 2 }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="profile-picture-upload"
              type="file"
              onChange={handleProfilePictureChange}
            />
            <label htmlFor="profile-picture-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraIcon />}
                sx={{ mb: 2 }}
              >
                Change Photo
              </Button>
            </label>
            <Typography variant="body2" color="text.secondary" align="center">
              Upload a new profile picture
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Button
              variant="contained"
              color={checkedIn ? 'secondary' : 'primary'}
              onClick={checkedIn ? handleCheckOut : handleCheckIn}
              sx={{ mb: 2 }}
            >
              {checkedIn ? 'Check Out' : 'Check In'}
            </Button>

            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={toggleTheme}
                  color="primary"
                />
              }
              label="Dark Mode"
              sx={{ mb: 2, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  color="primary"
                />
              }
              label="Email Notifications"
              sx={{ mb: 2, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  color="primary"
                />
              }
              label="Two-Factor Authentication"
              sx={{ mb: 2, display: 'block' }}
            />

            <Typography variant="subtitle2" gutterBottom>
              Session Timeout
            </Typography>
            <TextField
              fullWidth
              label="Session Timeout (minutes)"
              type="number"
              value={sessionTimeout}
              onChange={handleSessionTimeoutChange}
              margin="normal"
              InputProps={{ inputProps: { min: 1, max: 1440 } }}
              helperText="Set how long you can be inactive before being logged out"
              sx={{ mb: 2 }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, pr: 8, pb: 8 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SaveIcon />}
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>
      </Box>

      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          Profile updated successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
}
