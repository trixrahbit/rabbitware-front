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


const AnalyticsIndex = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDTypography variant="h4" fontWeight="medium" mb={3}>
          Analytics Dashboard
        </MDTypography>

        <Grid container spacing={3}>
          {/* Sample Analytics Widgets */}
          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon fontSize="large" color="info">bar_chart</Icon>
                <MDTypography variant="h6" mt={2}>Sales Performance</MDTypography>
                <MDTypography variant="body2" color="text" textAlign="center" mt={1}>
                  View revenue trends and key sales data.
                </MDTypography>
                <MDButton variant="contained" color="info" size="small" sx={{ mt: 2 }}>
                  View Report
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon fontSize="large" color="warning">show_chart</Icon>
                <MDTypography variant="h6" mt={2}>User Engagement</MDTypography>
                <MDTypography variant="body2" color="text" textAlign="center" mt={1}>
                  Analyze user activity and retention metrics.
                </MDTypography>
                <MDButton variant="contained" color="warning" size="small" sx={{ mt: 2 }}>
                  View Insights
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <Card>
              <MDBox p={2} display="flex" flexDirection="column" alignItems="center">
                <Icon fontSize="large" color="success">insights</Icon>
                <MDTypography variant="h6" mt={2}>Custom Reports</MDTypography>
                <MDTypography variant="body2" color="text" textAlign="center" mt={1}>
                  Generate detailed reports for your data.
                </MDTypography>
                <MDButton variant="contained" color="success" size="small" sx={{ mt: 2 }}>
                  Create Report
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

export default AnalyticsIndex;
