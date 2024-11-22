import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axios from 'axios';
import { useAuth } from 'context/AuthContext';

const NotificationSettings = () => {
  const { authToken, user } = useAuth(); // Assuming you have user info and authToken in your Auth context
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch the current notification settings
    const fetchNotificationSettings = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/users/${user.id}/notification-settings`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const { email, phoneNumber, emailNotifications, smsNotifications } = response.data;
        setEmail(email);
        setPhoneNumber(phoneNumber);
        setEmailNotifications(emailNotifications);
        setSmsNotifications(smsNotifications);
      } catch (error) {
        console.error('Error fetching notification settings:', error);
      }
    };

    fetchNotificationSettings();
  }, [authToken, user]);

  const handleSave = async () => {
    try {
      // Update the notification settings
      await axios.put(`http://localhost:8000/users/${user.id}/notification-settings`, {
        email,
        phoneNumber,
        emailNotifications,
        smsNotifications,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      alert('Notification settings updated successfully');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      alert('Failed to update notification settings');
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} p={3} component={Paper}>
          <Typography variant="h4" mb={3}>
            Notification Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <MDBox mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={emailNotifications}
                      onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                  }
                  label="Enable Email Notifications"
                />
              </MDBox>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Phone Number"
                fullWidth
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <MDBox mt={2}>
                <FormControlLabel
                  control={
                    <Switch
                      color="primary"
                      checked={smsNotifications}
                      onChange={(e) => setSmsNotifications(e.target.checked)}
                    />
                  }
                  label="Enable SMS Notifications"
                />
              </MDBox>
            </Grid>
          </Grid>
          <MDBox mt={3} textAlign="right">
            <MDButton variant="contained" color="primary" onClick={handleSave}>
              Save
            </MDButton>
          </MDBox>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default NotificationSettings;
