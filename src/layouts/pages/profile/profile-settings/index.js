// React imports
import React from 'react';

// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";

// Profile Settings Components
import Sidenav from "layouts/pages/profile/profile-settings/components/Sidenav";
import Header from "layouts/pages/profile/components/Header";
import BasicInfo from "layouts/pages/profile/profile-settings/components/BasicInfo";
import ChangePassword from "layouts/pages/profile/profile-settings/components/ChangePassword";
import Authentication from "layouts/pages/profile/profile-settings/components/Authentication";
import Accounts from "layouts/pages/profile/profile-settings/components/Accounts";
import Notifications from "layouts/pages/profile/profile-settings/components/Notifications";
import Sessions from "layouts/pages/profile/profile-settings/components/Sessions";
import DeleteAccount from "layouts/pages/profile/profile-settings/components/DeleteAccount";
import PlatformSettings from "../profile-overview/components/PlatformSettings";

// Context or custom hook for user info (adjust according to your setup)
import { useAuth } from "context/AuthContext"; // Assuming this is your Auth context

function ProfileSettingsPage() {
  const { state } = useAuth(); // Using auth state from context
  console.log("Auth State in ProfileSettingsPage:", state);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <Header /> {/* Move Header outside the main Grid container to span the top */}
      <MDBox mt={4}>
        <Grid container spacing={3}>
          {/* Adjust the Grid layout to align Sidenav with the right elements */}
          <Grid container item spacing={3}>
            <Grid item xs={12} lg={3}>
              <MDBox pt={5}> {/* Add padding top to Sidenav to align it with the right side content */}
                <Sidenav />
              </MDBox>
            </Grid>
            <Grid item xs={12} lg={9}>
              <MDBox mb={3}>
                <Grid container spacing={3}>
                  {/* Place each component in its own Grid item */}
                  <Grid item xs={12}>
                    <BasicInfo />
                  </Grid>
                  <Grid item xs={12}>
                    <PlatformSettings />
                    </Grid>
                  <Grid item xs={12}>
                    <ChangePassword />
                  </Grid>
                  <Grid item xs={12}>
                    <Authentication />
                  </Grid>
                  <Grid item xs={12}>
                    <Accounts />
                  </Grid>
                  <Grid item xs={12}>
                    <Notifications />
                  </Grid>
                  <Grid item xs={12}>
                    <Sessions />
                  </Grid>
                  <Grid item xs={12}>
                    <DeleteAccount />
                  </Grid>
                </Grid>
              </MDBox>
            </Grid>
          </Grid>
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default ProfileSettingsPage;

