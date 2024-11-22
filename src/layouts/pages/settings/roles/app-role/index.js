// In your AppRolesPage.js
import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import AppRolesData from "./components/app-role-data"; // Adjust import path as necessary

const AppRoles = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
        <MDTypography variant="h4" fontWeight="medium">Application Roles</MDTypography>
        <MDBox mt={2}>
          <AppRolesData />
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default AppRoles;
