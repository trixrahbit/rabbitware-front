import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import DashboardLayout from 'examples/LayoutContainers/DashboardLayout';
import DashboardNavbar from 'examples/Navbars/DashboardNavbar';
import Footer from 'examples/Footer';
import { useAuth } from 'context/AuthContext';
import { useClients } from 'context/ClientsContext';  // Import useClients to access subscription data

const SubscriptionPage = () => {
  const { user } = useAuth();
  const { subscription } = useClients();  // Access subscription data from the context

  const subscriptions = [
    { name: 'Basic', features: ['CRM', 'Tickets', 'Calendar'] },
    { name: 'Premium', features: ['CRM', 'Tickets', 'Calendar', 'Sales', 'Projects', 'Forms'] },
    { name: 'Enterprise', features: ['CRM', 'Tickets', 'Calendar', 'Sales', 'Projects', 'Forms', 'Analytics', 'API'] },
  ];

  const handleUpgrade = (plan) => {
    // Logic to upgrade subscription, e.g., API call to backend
    console.log(`Upgrading to ${plan}`);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDBox mb={2}>
          <Typography variant="h4" fontWeight="medium">
            Subscription Plans
          </Typography>
        </MDBox>
        <Grid container spacing={3}>
          {subscriptions.map((sub) => (
            <Grid item xs={12} md={6} key={sub.name}>
              <MDBox p={2} border="1px solid #ccc" borderRadius="8px" backgroundColor="#f8f9fa">
                <Typography variant="h6">{sub.name} Plan</Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                  Access to: {sub.features.join(', ')}.
                </Typography>
                <MDButton
                  variant="contained"
                  color="info"
                  onClick={() => handleUpgrade(sub.name)}
                  disabled={subscription && subscription.name === sub.name}
                >
                  {subscription && subscription.name === sub.name ? 'Current Plan' : `Upgrade to ${sub.name}`}
                </MDButton>
              </MDBox>
            </Grid>
          ))}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default SubscriptionPage;
