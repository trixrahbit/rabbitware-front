import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Paper,
  Avatar
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { Save as SaveIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [value, setValue] = useState(() => {
    try {
      // Get the saved tab index from localStorage or default to 0
      const savedTab = localStorage.getItem('settingsTab');
      return savedTab !== null ? parseInt(savedTab, 10) : 0;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 0;
    }
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Settings saved successfully!');
  const [localError, setLocalError] = useState('');
  const { settings, loading, error, updateSettings, fetchSettings, setSettings } = useSettings();

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    try {
      // Save the selected tab index to localStorage
      localStorage.setItem('settingsTab', newValue.toString());
    } catch (error) {
      console.error('Error saving tab to localStorage:', error);
    }
  };

  useEffect(() => {
    // Fetch settings when the component mounts, but only if they haven't been loaded yet
    if (!settings || Object.keys(settings).length === 0) {
      fetchSettings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add a loading state to show while settings are being fetched
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading settings...
        </Typography>
      </Box>
    );
  }

  const handleChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...(settings[section] || {}),
        [field]: value
      }
    });
  };

  const handleNestedChange = (section, nestedObject, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...(settings[section] || {}),
        [nestedObject]: {
          ...((settings[section] && settings[section][nestedObject]) || {}),
          [field]: value
        }
      }
    });
  };

  const handleTestTeamsNotification = async () => {
    try {
      setSaving(true);
      setLocalError('');

      // Send a test notification to the current user
      const response = await axios.post('/api/notifications/test-teams', {
        serviceUrl: settings.notifications.teamsConfiguration?.serviceUrl,
        conversationId: settings.notifications.teamsConfiguration?.conversationId,
        recipientId: settings.notifications.teamsConfiguration?.recipientId
      });

      setSuccess(true);
      setSuccessMessage('Test notification sent successfully!');
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error sending test notification:', error);
      setLocalError('Failed to send test notification. Please check your Teams configuration and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDomainChange = (event) => {
    const {
      target: { value },
    } = event;

    handleChange('authentication', 'allowedDomains', 
      typeof value === 'string' ? value.split(',') : value
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setLocalError('');

      // Save all settings using the updateSettings function from the context
      // Note: updateSettings no longer sets the loading state, so we don't need to worry about that
      const success = await updateSettings(settings);

      if (success) {
        setSuccess(true);
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setLocalError('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setLocalError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };


  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure your application settings and preferences.
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="General" />
            <Tab label="Authentication" />
            <Tab label="Notifications" />
            <Tab label="SLA Time Frames" />
            <Tab label="Business Hours" />
            <Tab label="Branding" />
            <Tab label="Datasets" />
          </Tabs>
        </Box>

        {/* General Settings */}
        <TabPanel value={value} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Name"
                value={settings?.general?.siteName || 'RabbitAI Admin'}
                onChange={(e) => handleChange('general', 'siteName', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Name"
                value={settings?.general?.companyName || 'Your Company'}
                onChange={(e) => handleChange('general', 'companyName', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Support Email"
                type="email"
                value={settings?.general?.supportEmail || 'support@example.com'}
                onChange={(e) => handleChange('general', 'supportEmail', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="API URL"
                value={settings?.general?.apiUrl || 'https://api.example.com'}
                onChange={(e) => handleChange('general', 'apiUrl', e.target.value)}
                margin="normal"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="timezone-label">Timezone</InputLabel>
                <Select
                  labelId="timezone-label"
                  value={settings?.general?.timezone || 'UTC'}
                  onChange={(e) => handleChange('general', 'timezone', e.target.value)}
                  label="Timezone"
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
              <Typography variant="caption" color="text.secondary">
                This timezone will be used for displaying dates and times throughout the application.
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Authentication Settings */}
        <TabPanel value={value} index={1}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.authentication?.allowEmailLogin || false}
                    onChange={(e) => handleChange('authentication', 'allowEmailLogin', e.target.checked)}
                    color="primary"
                  />
                }
                label="Allow Email/Password Login"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.authentication?.allowM365Login || false}
                    onChange={(e) => handleChange('authentication', 'allowM365Login', e.target.checked)}
                    color="primary"
                  />
                }
                label="Allow Microsoft 365 Login"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.authentication?.requireMFA || false}
                    onChange={(e) => handleChange('authentication', 'requireMFA', e.target.checked)}
                    color="primary"
                  />
                }
                label="Require Multi-Factor Authentication"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default Session Timeout (minutes)"
                type="number"
                value={settings?.authentication?.sessionTimeout || 60}
                onChange={(e) => handleChange('authentication', 'sessionTimeout', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 5, max: 1440 } }}
                helperText="Default timeout for all users. Users can override this in their profile settings."
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="allowed-domains-label">Allowed Domains</InputLabel>
                <Select
                  labelId="allowed-domains-label"
                  multiple
                  value={settings?.authentication?.allowedDomains || []}
                  onChange={handleDomainChange}
                  input={<OutlinedInput label="Allowed Domains" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {Array.isArray(selected) ? selected.map((value) => (
                        <Chip key={value} label={value} />
                      )) : null}
                    </Box>
                  )}
                >
                  {Array.isArray(settings?.authentication?.allowedDomains) ? 
                    settings.authentication.allowedDomains.map((domain) => (
                      <MenuItem key={domain} value={domain}>
                        {domain}
                      </MenuItem>
                    )) : null}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                Add domains by typing them and pressing Enter. Only users with email addresses from these domains will be allowed to log in.
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Notifications Settings */}
        <TabPanel value={value} index={2}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.notifications?.emailNotifications || false}
                    onChange={(e) => handleChange('notifications', 'emailNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Email Notifications"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.notifications?.teamsNotifications || false}
                    onChange={(e) => handleChange('notifications', 'teamsNotifications', e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable Teams Notifications"
              />
            </Grid>
            {settings.notifications.teamsNotifications && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Teams Bot Configuration
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Service URL"
                    value={settings.notifications.teamsConfiguration?.serviceUrl || ''}
                    onChange={(e) => handleNestedChange('notifications', 'teamsConfiguration', 'serviceUrl', e.target.value)}
                    margin="normal"
                    helperText="The service URL for the Teams bot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Conversation ID"
                    value={settings.notifications.teamsConfiguration?.conversationId || ''}
                    onChange={(e) => handleNestedChange('notifications', 'teamsConfiguration', 'conversationId', e.target.value)}
                    margin="normal"
                    helperText="The conversation ID for the Teams bot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Recipient ID"
                    value={settings.notifications.teamsConfiguration?.recipientId || ''}
                    onChange={(e) => handleNestedChange('notifications', 'teamsConfiguration', 'recipientId', e.target.value)}
                    margin="normal"
                    helperText="The recipient ID for the Teams bot"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={handleTestTeamsNotification}
                    sx={{ mt: 2 }}
                  >
                    Test Teams Notification
                  </Button>
                </Grid>
              </>
            )}
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.notifications?.notifyOnTicketCreated || false}
                    onChange={(e) => handleChange('notifications', 'notifyOnTicketCreated', e.target.checked)}
                    color="primary"
                  />
                }
                label="Notify on Ticket Created"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.notifications?.notifyOnTicketUpdated || false}
                    onChange={(e) => handleChange('notifications', 'notifyOnTicketUpdated', e.target.checked)}
                    color="primary"
                  />
                }
                label="Notify on Ticket Updated"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.notifications?.notifyOnSystemErrors || false}
                    onChange={(e) => handleChange('notifications', 'notifyOnSystemErrors', e.target.checked)}
                    color="primary"
                  />
                }
                label="Notify on System Errors"
              />
            </Grid>
          </Grid>
        </TabPanel>


        {/* SLA Time Frames Settings */}
        <TabPanel value={value} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings?.sla?.enabled || false}
                    onChange={(e) => handleChange('sla', 'enabled', e.target.checked)}
                    color="primary"
                  />
                }
                label="Enable SLA Tracking"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Default SLA Hours"
                type="number"
                value={settings?.sla?.defaultSlaHours || 24}
                onChange={(e) => handleChange('sla', 'defaultSlaHours', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 168 } }}
                helperText="Default SLA time in hours for all tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Critical Priority SLA Hours"
                type="number"
                value={settings?.sla?.criticalPrioritySlaHours || 4}
                onChange={(e) => handleChange('sla', 'criticalPrioritySlaHours', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 168 } }}
                helperText="SLA time in hours for critical priority tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="High Priority SLA Hours"
                type="number"
                value={settings?.sla?.highPrioritySlaHours || 8}
                onChange={(e) => handleChange('sla', 'highPrioritySlaHours', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 168 } }}
                helperText="SLA time in hours for high priority tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medium Priority SLA Hours"
                type="number"
                value={settings?.sla?.mediumPrioritySlaHours || 16}
                onChange={(e) => handleChange('sla', 'mediumPrioritySlaHours', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 168 } }}
                helperText="SLA time in hours for medium priority tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Low Priority SLA Hours"
                type="number"
                value={settings?.sla?.lowPrioritySlaHours || 24}
                onChange={(e) => handleChange('sla', 'lowPrioritySlaHours', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 168 } }}
                helperText="SLA time in hours for low priority tickets"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Warning Threshold"
                type="number"
                value={settings?.sla?.warningThreshold || 0.75}
                onChange={(e) => handleChange('sla', 'warningThreshold', parseFloat(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
                helperText="Threshold percentage for SLA warning alerts (0-1, e.g., 0.75 for 75%)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Check Interval (minutes)"
                type="number"
                value={settings?.sla?.checkInterval || 15}
                onChange={(e) => handleChange('sla', 'checkInterval', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 1, max: 60 } }}
                helperText="How often to check for SLA breaches (in minutes)"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Business Hours Settings */}
        <TabPanel value={value} index={4}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Hours Start"
                type="number"
                value={settings?.businessHours?.businessHoursStart || 9}
                onChange={(e) => handleChange('businessHours', 'businessHoursStart', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 23 } }}
                helperText="Business hours start time (24-hour format, e.g., 9 for 9:00 AM)"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Business Hours End"
                type="number"
                value={settings?.businessHours?.businessHoursEnd || 17}
                onChange={(e) => handleChange('businessHours', 'businessHoursEnd', parseInt(e.target.value))}
                margin="normal"
                InputProps={{ inputProps: { min: 0, max: 23 } }}
                helperText="Business hours end time (24-hour format, e.g., 17 for 5:00 PM)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Business Days"
                value={settings?.businessHours?.businessDays || "Monday,Tuesday,Wednesday,Thursday,Friday"}
                onChange={(e) => handleChange('businessHours', 'businessDays', e.target.value)}
                margin="normal"
                helperText="Comma-separated list of business days (e.g., Monday,Tuesday,Wednesday,Thursday,Friday)"
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Branding Settings */}
        <TabPanel value={value} index={5}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Application Logo
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Customize your application's logo. The logo will be displayed in the sidebar and other areas of the application.
              </Typography>
            </Grid>

            {/* Light Mode Logo Upload */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px dashed rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Light Mode Logo
                </Typography>

                {/* Logo Preview */}
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Avatar
                    src={settings?.branding?.logo || '/logo.png'}
                    alt="Light Mode Logo"
                    sx={{ width: 120, height: 120, mb: 1 }}
                    variant="square"
                  />
                </Box>

                {/* Upload Button */}
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // Convert the file to a data URL (base64) that will persist across page refreshes
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target.result;
                          handleChange('branding', 'logo', dataUrl);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Recommended size: 200x200 pixels. PNG or SVG with transparent background works best.
                </Typography>
              </Paper>
            </Grid>

            {/* Dark Mode Logo Upload */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: '1px dashed rgba(0, 0, 0, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  Dark Mode Logo
                </Typography>

                {/* Logo Preview */}
                <Box sx={{ mb: 2, mt: 1 }}>
                  <Avatar
                    src={settings?.branding?.darkLogo || settings?.branding?.logo || '/logo.png'}
                    alt="Dark Mode Logo"
                    sx={{ width: 120, height: 120, mb: 1 }}
                    variant="square"
                  />
                </Box>

                {/* Upload Button */}
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mt: 1 }}
                >
                  Upload Logo
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        // Convert the file to a data URL (base64) that will persist across page refreshes
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target.result;
                          handleChange('branding', 'darkLogo', dataUrl);
                        };
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                  Optional: If not provided, the light mode logo will be used in dark mode as well.
                </Typography>
              </Paper>
            </Grid>

            {/* Dark Mode Toggle */}
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid rgba(0, 0, 0, 0.12)' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings?.branding?.darkMode || false}
                      onChange={(e) => handleChange('branding', 'darkMode', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Enable Dark Mode by Default"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  When enabled, the application will start in dark mode for all users. Users can still toggle between light and dark mode.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Datasets Settings */}
        <TabPanel value={value} index={6}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Datasets
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Manage datasets from your integrations. Datasets are tables in the database that belong to a data source.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => navigate('/dashboard/datasets')}
                sx={{ mt: 2 }}
              >
                Manage Datasets
              </Button>
            </Grid>
          </Grid>
        </TabPanel>

        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Card>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {localError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {localError}
        </Alert>
      )}
    </Box>
  );
}
