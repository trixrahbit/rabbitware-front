// In your ApplicationUsersPage.js
import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import ApplicationUsersData from "./components/app-user-data"; // Adjust import path as necessary

const ApplicationUsersPage = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="medium">Users</MDTypography>
        <MDBox mt={2}>
          <ApplicationUsersData />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default ApplicationUsersPage;
