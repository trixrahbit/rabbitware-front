// @mui material components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { useUserInfo } from "./data/profile_data";
// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 PRO React examples
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";

// Overview page components
import Header from "layouts/pages/profile/components/Header";
import PlatformSettings from "layouts/pages/profile/profile-overview/components/PlatformSettings";


function Overview() {
  // Assume useUserInfo does not require arguments, or adjust according to your context setup
  const { userInfo, isLoading, error } = useUserInfo();

  if (isLoading) return <MDTypography>Loading...</MDTypography>; // Loading state
  if (error) return <MDTypography>Error: {error.message}</MDTypography>; // Error state

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header>
        <MDBox mt={5} mb={3}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6} xl={4}>
              <PlatformSettings />
            </Grid>
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              {/* Conditionally render ProfileInfoCard with user info */}
              {userInfo && (
                <ProfileInfoCard
                  title="profile information"
                  description={`Hi, I’m ${userInfo.fullName}, ${userInfo.bio || 'No bio available'}.`}
                  info={{
                    fullName: userInfo.fullName,
                    mobile: userInfo.mobile,
                    email: userInfo.email,
                    location: userInfo.location,
                  }}
                  action={{ route: "", tooltip: "Edit Profile" }}
                  shadow={false}
                />
              )}
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
            <Grid item xs={12} xl={4}>
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}
export default Overview;
