import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import Calendar from "examples/Calendar";

const BookingPage = () => {
  const { authToken, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [bookingUrl, setBookingUrl] = useState('');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');

useEffect(() => {
  const fetchBookingDetails = async () => {
    try {
      const [urlResponse, timesResponse, logoResponse] = await Promise.all([
        axios.get(`https://app.webitservices.com/api/users/${user.id}/booking-url`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`https://app.webitservices.com/api/users/${user.id}/available-times`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        axios.get(`https://app.webitservices.com/api/users/${user.id}/branding-settings`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      setBookingUrl(urlResponse.data);

      const times = timesResponse.data.available_times.map(time => ({
        title: "Available",
        start: time.start,
        end: time.end,
        className: "event-info"
      }));

      console.log("Available Times:", times);
      setAvailableTimes(times);
      setLogoUrl(logoResponse.data.logoUrl || '');

    } catch (err) {
      console.error('Error fetching booking details:', err);
      setAvailableTimes([]); // Handle the case where no available times are fetched
    }
  };

  if (user && user.id) {
    fetchBookingDetails();
  }
}, [authToken, user]);






  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} p={3} component={Paper} textAlign="center">
          <Typography variant="h4" mb={3}>
            Booking Page
          </Typography>
          <MDButton variant="contained" color="primary" onClick={handleOpen}>
            Preview Booking Page
          </MDButton>
        </MDBox>

        <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
          <DialogContent>
            <Grid container spacing={3}>
              {/* Left section with logo */}
              <Grid item xs={12} md={3}>
                <MDBox display="flex" justifyContent="center">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" style={{ maxWidth: '100%', height: 'auto' }} />
                  ) : (
                    <Typography>No Logo Available</Typography>
                  )}
                </MDBox>
              </Grid>

              {/* Right section with calendar */}
              <Grid item xs={12} md={6}>
                <Calendar
                  header={{
                    title: "Available Dates",
                  }}
                  events={availableTimes}
                />
              </Grid>

              {/* Bottom section with available times */}
              <Grid item xs={12}>
                <Typography variant="h6" mb={2}>
                  Available Times:
                </Typography>
                <MDBox display="flex" justifyContent="center" flexWrap="wrap">
                  {availableTimes.length > 0 ? (
                    availableTimes.map((time, index) => (
                      <MDBox key={index} mx={1} mb={2}>
                        <MDButton variant="contained" color="info">
                          {new Date(time.start).toLocaleString()}
                        </MDButton>
                      </MDBox>
                    ))
                  ) : (
                    <Typography>No available times</Typography>
                  )}
                </MDBox>
              </Grid>
            </Grid>
          </DialogContent>
        </Dialog>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default BookingPage;
