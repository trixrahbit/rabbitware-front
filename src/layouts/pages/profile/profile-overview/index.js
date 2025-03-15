// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useUserInfo } from "./data/profile_data";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Dashboard Layout Components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";

// Profile Page Components
import Header from "layouts/pages/profile/components/Header";
import PlatformSettings from "layouts/pages/profile/profile-overview/components/PlatformSettings";

function Overview() {
  console.log("🔍 Fetching User Info...");

  const { userInfo, isLoading, error } = useUserInfo();

  console.log("✅ User Info:", userInfo);
  console.log("🟡 Loading State:", isLoading);
  console.log("🚨 Error State:", error);

  // ✅ Handle Loading State
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" height="80vh">
          <MDTypography variant="h6">Loading Profile...</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // ✅ Handle Error State
  if (error) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" height="80vh">
          <MDTypography variant="h6" color="error">Error: {error.message}</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            {/* Settings Column */}
            <Grid item xs={12} md={6} xl={4}>
              <PlatformSettings />
            </Grid>

            {/* Profile Information Card */}
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              {userInfo && (
                <ProfileInfoCard
                  title="Profile Information"
                  description={`Hi, I’m ${userInfo.name || "N/A"}, welcome to your profile page.`}
                  info={{
                    fullName: userInfo.name || "Not Available",
                    mobile: userInfo.mobile || "Not Available",
                    email: userInfo.email || "Not Available",
                    location: userInfo.location || "Not Available",
                    organization: userInfo.organization_id ? `Org ID: ${userInfo.organization_id}` : "Not Assigned",
                  }}
                  action={{ route: "/edit-profile", tooltip: "Edit Profile" }}
                  shadow={false}
                />
              )}
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>

            <Grid item xs={12} xl={4}>
              {/* Add additional sections here if needed */}
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
