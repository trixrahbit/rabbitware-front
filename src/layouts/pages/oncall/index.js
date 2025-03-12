import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import MDButton from "components/MDButton";

const OnCallIndex = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDTypography variant="h4" fontWeight="medium" mb={3}>
          On-Call Management
        </MDTypography>

        <Grid container spacing={3}>
          {/* Sample On-Call Widgets */}
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon fontSize="large" color="info">schedule</Icon>
                <MDTypography variant="h6" mt={2}>On-Call Schedule</MDTypography>
                <MDTypography variant="body2" color="text" textAlign="center" mt={1}>
                  View and manage the current on-call schedule.
                </MDTypography>
                <MDButton variant="contained" color="info" size="small" sx={{ mt: 2 }}>
                  View Schedule
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon fontSize="large" color="warning">phone_callback</Icon>
                <MDTypography variant="h6" mt={2}>Emergency Contacts</MDTypography>
                <MDTypography variant="body2" color="text" textAlign="center" mt={1}>
                  Access emergency contact details for on-call staff.
                </MDTypography>
                <MDButton variant="contained" color="warning" size="small" sx={{ mt: 2 }}>
                  View Contacts
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon fontSize="large" color="success">report_problem</Icon>
                <MDTypography variant="h6" mt={2}>Incident Reports</MDTypography>
                <MDTypography variant="body2" color="text" textAlign="center" mt={1}>
                  Submit and review on-call incident reports.
                </MDTypography>
                <MDButton variant="contained" color="success" size="small" sx={{ mt: 2 }}>
                  Report Incident
                </MDButton>
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default OnCallIndex;
