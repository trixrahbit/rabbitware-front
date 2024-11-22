import React, {useState} from "react";

// Material Dashboard 2 PRO React components and layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import OrgCountCard from "./components/stats/orgCountCard";
// Custom components for organizations page
import OrganizationsData from "./components/organizationsdata";
import Grid from "@mui/material/Grid";
import ComplexStatisticsCard from "../../../../examples/Cards/StatisticsCards/ComplexStatisticsCard";

const OrganizationsPage = () => {


  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} md={6} lg={3}>
<MDBox mb={1.5}>
       <OrgCountCard />
</MDBox>

          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Revenue"
                count="34k"
                percentage={{ color: "success", amount: "+1%", label: "than yesterday" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Followers"
                count="+91"
                percentage={{ color: "success", amount: "", label: "Just updated" }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox pt={4} pb={2} position="relative">
          <MDTypography variant="h4" fontWeight="medium" mb={2}>
            Organizations
          </MDTypography>
          <MDTypography variant="body2" color="secondary" mb={2}>
            Overview and management of your organizations.
          </MDTypography>
<OrganizationsData  />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default OrganizationsPage;
