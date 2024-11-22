import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TimezoneSelect from 'react-timezone-select';
import Modal from "@mui/material/Modal";
import AddIcon from "@mui/icons-material/Add";

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const UserProfile = () => {
  const { authToken, user } = useAuth();
  const [bookingUrl, setBookingUrl] = useState('');
  const [isOutlookConnected, setIsOutlookConnected] = useState(false);
  const [businessHours, setBusinessHours] = useState(
    daysOfWeek.map(day => ({ day_of_week: day, start_time: '', end_time: '' }))
  );
  const [timeZone, setTimeZone] = useState({ value: '', label: '' });
  const [isAdminConsentRequired, setIsAdminConsentRequired] = useState(false);
  const [bookingLinks, setBookingLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [duration, setDuration] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const urlResponse = await axios.get(`http://localhost:8000/users/${user.id}/booking-url`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBookingUrl(urlResponse.data || '');

        const hoursResponse = await axios.get(`http://localhost:8000/users/${user.id}/business-hours`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (hoursResponse.data.length > 0) {
          setBusinessHours(hoursResponse.data);
        } else {
          setBusinessHours(
            daysOfWeek.map(day => ({ day_of_week: day, start_time: '', end_time: '' }))
          );
        }

        const timeZoneResponse = await axios.get(`http://localhost:8000/users/${user.id}/time-zone`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        const timeZoneValue = timeZoneResponse.data || '';
        setTimeZone({ value: timeZoneValue || '', label: timeZoneValue || '' });

        const tokenValidationResponse = await axios.get(`http://localhost:8000/validate-outlook-token`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setIsOutlookConnected(tokenValidationResponse.data.isValid);

        const linksResponse = await axios.get(`http://localhost:8000/users/${user.id}/booking-links`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setBookingLinks(linksResponse.data);

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (user && user.id) {
      fetchUserData();
    }
  }, [authToken, user]);

  const handleSaveBookingUrl = async () => {
    try {
      const payload = { booking_url: bookingUrl };

      await axios.put(`http://localhost:8000/users/${user.id}/booking-url`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert('Booking URL updated successfully');
    } catch (error) {
      console.error('Error updating booking URL:', error);
      alert('Failed to update booking URL');
    }
  };

  const handleSaveBusinessHours = async () => {
    try {
      const sanitizedBusinessHours = businessHours.map(hour => ({
        day_of_week: hour.day_of_week || "",
        start_time: hour.start_time || "",
        end_time: hour.end_time || ""
      }));

      await axios.post(`http://localhost:8000/users/${user.id}/business-hours`, sanitizedBusinessHours, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert('Business hours updated successfully');
    } catch (error) {
      console.error('Error updating business hours:', error);
      alert('Failed to update business hours');
    }
  };

  const handleSaveTimeZone = async () => {
    try {
      const payload = { time_zone: timeZone.value || '' };

      await axios.put(`http://localhost:8000/users/${user.id}/time-zone`, payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      alert('Time zone updated successfully');
    } catch (error) {
      console.error('Error updating time zone:', error);
      alert('Failed to update time zone');
    }
  };

  const handleConnectOutlook = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/connect-to-outlook?state=${user.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const authUrl = response.data.authUrl;
      window.open(authUrl, '_blank', 'width=600,height=700');

      if (response.data.isAdminConsentRequired) {
        setIsAdminConsentRequired(true);
      }
    } catch (error) {
      console.error('Error connecting to Outlook:', error);
      alert('Failed to connect to Outlook');
    }
  };

  const handleAdminConsent = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/admin-consent`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const consentUrl = response.data.consentUrl;
      window.open(consentUrl, '_blank', 'width=600,height=700');
    } catch (error) {
      console.error('Error getting admin consent:', error);
      alert('Failed to initiate admin consent');
    }
  };

  const handleBusinessHoursChange = (index, field, value) => {
    const updatedHours = [...businessHours];
    updatedHours[index][field] = value || '';
    setBusinessHours(updatedHours);
  };

  const handleCreateNewLink = async () => {
    try {
      const newLinkData = { name: linkName, duration: parseInt(duration, 10) };
      const response = await axios.post(`http://localhost:8000/users/${user.id}/booking-links`, newLinkData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      setBookingLinks([...bookingLinks, response.data]);
      setOpen(false);
    } catch (error) {
      console.error("Error creating booking link:", error);
    }
  };

  const extractUUID = (url) => {
    return url.split('/').pop();
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Booking URL and Time Zone */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Booking URL & Time Zone
                </Typography>
                <Grid container spacing={2} alignItems="flex-end">
                  <Grid item xs={6}>
                    <TextField
                      label="Booking URL"
                      fullWidth
                      value={bookingUrl || ''}
                      onChange={(e) => setBookingUrl(e.target.value)}
                      style={{ marginBottom: '16px' }}
                      inputProps={{ style: { width: '100%' } }}
                    />
                    <MDButton variant="contained" color="primary" onClick={handleSaveBookingUrl}>
                      Save Booking URL
                    </MDButton>
                  </Grid>
                  <Grid item xs={6}>
<TimezoneSelect
  value={timeZone.value ? timeZone : undefined}
  onChange={setTimeZone}
  styles={{
    control: (provided) => ({
      ...provided,
      width: '100%',
      height: '44px', // Set the desired height here
      minHeight: '40px', // Ensure this matches the height for consistency
      fontSize: '14px', // Adjust font size if necessary
    }),
  }}
/>

                    <MDButton variant="contained" color="primary" onClick={handleSaveTimeZone} style={{ marginTop: '16px' }}>
                      Save Time Zone
                    </MDButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Connect to Outlook */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Connect to Outlook
                </Typography>
                <MDButton
                  variant="contained"
                  color={isOutlookConnected ? "success" : "info"}
                  onClick={handleConnectOutlook}
                  style={{ marginTop: '16px', display: 'flex', alignItems: 'center' }}
                >
                  {isOutlookConnected ? (
                    <>
                      Connected to Outlook <CheckCircleIcon style={{ marginLeft: '5px', color: 'green' }} />
                    </>
                  ) : "Connect to Outlook"}
                </MDButton>
                {isAdminConsentRequired && (
                  <MDButton
                    variant="contained"
                    color="warning"
                    onClick={handleAdminConsent}
                    style={{ marginLeft: '10px', marginTop: '16px' }}
                  >
                    Admin Consent Required
                  </MDButton>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Business Hours */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Business Hours
                </Typography>
                {businessHours.map((hour, index) => (
                  <Grid container spacing={2} key={index} style={{ marginBottom: '16px' }}>
                    <Grid item xs={4}>
                      <TextField
                        label="Day"
                        value={hour.day_of_week || daysOfWeek[index]}
                        fullWidth
                        disabled
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="Start Time"
                        type="time"
                        value={hour.start_time || ''}
                        onChange={(e) => handleBusinessHoursChange(index, 'start_time', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        label="End Time"
                        type="time"
                        value={hour.end_time || ''}
                        onChange={(e) => handleBusinessHoursChange(index, 'end_time', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  </Grid>
                ))}
                <MDButton variant="contained" color="primary" onClick={handleSaveBusinessHours} style={{ marginTop: '16px' }}>
                  Save Business Hours
                </MDButton>
              </CardContent>
            </Card>
          </Grid>

          {/* Booking Links */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" mb={2}>
                  Booking Links
                </Typography>
                <Grid container spacing={3}>
                  {bookingLinks.map((link) => (
                    <Grid item xs={12} key={link.id}>
                      <MDBox p={2} border="1px solid #ccc" borderRadius="8px" backgroundColor="#f8f9fa">
                        <Typography variant="h6">{link.name}</Typography>
                        <Typography variant="body2" color="textSecondary" mb={2}>
                          UUID: {extractUUID(link.url)}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" mb={2}>
                          Duration: {link.duration ? `${link.duration} minutes` : 'Not Set'}
                        </Typography>
                      </MDBox>
                    </Grid>
                  ))}
                </Grid>
                <MDBox mt={4} textAlign="center">
                  <MDButton variant="contained" color="info" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Create New Link
                  </MDButton>
                </MDBox>

                <Modal open={open} onClose={() => setOpen(false)}>
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                    p={4}
                    style={{ backgroundColor: 'white', borderRadius: '8px', margin: 'auto', width: '300px', marginTop: '100px' }}
                  >
                    <Typography variant="h6" mb={2}>Create Booking Link</Typography>
                    <TextField
                      label="Link Name"
                      value={linkName}
                      onChange={(e) => setLinkName(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                    <TextField
                      label="Duration (Minutes)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      fullWidth
                      margin="normal"
                    />
                    <MDButton variant="contained" color="primary" onClick={handleCreateNewLink} style={{ marginTop: '16px' }}>
                      Save
                    </MDButton>
                  </MDBox>
                </Modal>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default UserProfile;
