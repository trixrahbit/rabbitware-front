import React from 'react';
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from 'components/MDBox';
import Grid from "@mui/material/Grid";
import MDTypography from "components/MDTypography";

const CalendlyDashboard = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="medium" mb={2}>
          Calender Dashboard
        </MDTypography>
        <Grid container spacing={3}>
          {/* You can place your components here in the grid, similar to how it is done in the Projects page */}
          <Grid item xs={12} md={6}>
            {/* Example Component */}
            <MDBox p={2} border="1px solid #ccc" borderRadius="8px" backgroundColor="#f8f9fa">
              <MDTypography variant="h6">Example Widget</MDTypography>
              {/* Replace this with actual components or charts */}
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Another Example Component */}
            <MDBox p={2} border="1px solid #ccc" borderRadius="8px" backgroundColor="#f8f9fa">
              <MDTypography variant="h6">Another Widget</MDTypography>
              {/* Replace this with actual components or charts */}
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default CalendlyDashboard;
