import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import { useAuth } from 'context/AuthContext';

const MeetingManagement = () => {
  const { user, authToken } = useAuth(); // Get user and authToken from context
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await axios.get(`https://app.webitservices.com/api/users/${user.id}/calendar-events`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        setMeetings(response.data);
      } catch (err) {
        setError('Failed to fetch meetings.');
        console.error("Error fetching meetings:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && authToken) {
      fetchMeetings();
    }
  }, [user, authToken]);

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={3} p={2} component={Paper} variant="outlined">
            <Typography variant="h6">Loading meetings...</Typography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox py={3}>
          <MDBox mb={3} p={2} component={Paper} variant="outlined">
            <Typography variant="h6">{error}</Typography>
          </MDBox>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} p={2} component={Paper} variant="outlined">
          <Typography variant="h4" fontWeight="medium" gutterBottom>
            Meetings
          </Typography>
          <Grid container spacing={3}>
            {meetings.length > 0 ? (
              meetings.map((meeting) => (
                <Grid item xs={12} md={6} key={meeting.id}>
                  <MDBox
                    p={2}
                    borderRadius="lg"
                    shadow="md"
                    backgroundColor="white"
                  >
                    <Typography variant="h6" fontWeight="medium">{meeting.name}</Typography>
                    <Typography variant="body2" color="textSecondary" mb={1}>
                      Date: {meeting.date} - Time: {meeting.time}
                    </Typography>
                    <MDButton variant="outlined" color="info">
                      View Details
                    </MDButton>
                  </MDBox>
                </Grid>
              ))
            ) : (
              <Typography variant="body2" color="textSecondary">
                No meetings scheduled.
              </Typography>
            )}
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default MeetingManagement;
