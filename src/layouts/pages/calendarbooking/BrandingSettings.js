import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import axios from 'axios';
import { useAuth } from 'context/AuthContext';
import { useClients } from 'context/ClientsContext';

const BrandingSettings = () => {
  const { authToken } = useAuth();  // Get authToken from Auth context
  const { clients } = useClients();  // Assuming you're fetching client details from the Clients context
  const client_id = clients[0]?.id;  // Adjust this logic based on how you're handling clients

  const [logoUrl, setLogoUrl] = useState('');
  const [brandColor, setBrandColor] = useState('');

  useEffect(() => {
    if (!client_id) return;

    // Fetch branding settings from the backend
    const fetchBrandingSettings = async () => {
      try {
        const response = await axios.get(`https://app.webitservices.com/api/clients/${client_id}/branding-settings`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setLogoUrl(response.data.logoUrl || '');
        setBrandColor(response.data.brandColor || '');
      } catch (error) {
        console.error('Error fetching branding settings:', error);
      }
    };

    fetchBrandingSettings();
  }, [authToken, client_id]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Assuming you're storing the logo URL as a string in your database, you might need to upload the file to a server or a cloud storage and get a URL
    // For example, upload the file to an S3 bucket, then get the URL and update the logoUrl in the backend.
    const logoUrl = URL.createObjectURL(file); // Placeholder for actual upload logic

    try {
      // Update logo URL in the backend
      await axios.put(`http://localhost:8000/clients/${client_id}/branding-settings`, {
        logoUrl,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      alert('Logo URL updated successfully');
    } catch (error) {
      console.error('Error updating logo URL:', error);
      alert('Failed to update Logo URL');
    }
  };

  const handleColorChange = async () => {
    try {
      // Update brand color in the backend
      await axios.put(`http://localhost:8000/clients/${client_id}/branding-settings`, {
        brandColor,
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      alert('Brand color updated successfully');
    } catch (error) {
      console.error('Error updating brand color:', error);
      alert('Failed to update Brand Color');
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={3} p={3} component={Paper}>
          <Typography variant="h4" mb={3}>
            Branding Settings
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                style={{ display: 'none' }}
                id="logo-upload"
              />
              <label htmlFor="logo-upload">
                <MDButton variant="contained" color="info" component="span">
                  Upload Logo
                </MDButton>
              </label>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Brand Color"
                fullWidth
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
              />
              <MDBox mt={2}>
                <MDButton variant="contained" color="info" onClick={handleColorChange}>
                  Set Color
                </MDButton>
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default BrandingSettings;
