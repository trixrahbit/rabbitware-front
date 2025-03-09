import React, { useEffect, useState } from 'react';
import { Modal, TextField, Typography, Paper, Grid } from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import AddIcon from '@mui/icons-material/Add';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import axios from 'axios';
import { useAuth } from 'context/AuthContext';

const BookingLinkManager = () => {
  const { authToken, user } = useAuth();
  const [bookingLinks, setBookingLinks] = useState([]);
  const [open, setOpen] = useState(false);
  const [linkName, setLinkName] = useState('');
  const [duration, setDuration] = useState('');

  const fetchBookingLinks = async () => {
    try {
      const response = await axios.get(`https://app.webitservices.com/api/users/${user.id}/booking-links`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBookingLinks(response.data);
    } catch (error) {
      console.error("Error fetching booking links:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchBookingLinks();
    }
  }, [user, authToken]);

  const handleCreateNewLink = async () => {
    try {
      const newLinkData = { name: linkName, duration: parseInt(duration, 10) };
      const response = await axios.post(`https://app.webitservices.com/api/users/${user.id}/booking-links`, newLinkData, {
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
        <MDBox mb={3} p={3} component={Paper}>
          <Typography variant="h4" mb={2}>
            Booking Links
          </Typography>
          <Grid container spacing={3}>
            {bookingLinks.map((link) => (
              <Grid item xs={12} md={6} key={link.id}>
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
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default BookingLinkManager;
