import React, { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";
import axios from "axios";

// MUI Components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress"; // ✅ Loading Indicator

// Icons
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";

// Material Dashboard Components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Dashboard Layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ProfileInfoCard from "examples/Cards/InfoCards/ProfileInfoCard";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";

// Profile Page Components
import Header from "layouts/pages/profile/components/Header";
import PlatformSettings from "layouts/pages/profile/profile-overview/components/PlatformSettings";

// Sample Data & Images
import homeDecor1 from "assets/images/home-decor-1.jpg";
import homeDecor2 from "assets/images/home-decor-2.jpg";
import homeDecor3 from "assets/images/home-decor-3.jpg";
import homeDecor4 from "assets/images/home-decor-4.jpeg";
import team1 from "assets/images/team-1.jpg";
import team2 from "assets/images/team-2.jpg";
import team3 from "assets/images/team-3.jpg";
import team4 from "assets/images/team-4.jpg";

function UserProfile() {
  const { authToken } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // ✅ Error State Handling

  useEffect(() => {
    const fetchUserProfile = async () => {
      console.log("🚀 Fetching user profile..."); // ✅ Log API Call

      if (!authToken) {
        console.error("❌ No authentication token found.");
        setError("No authentication token found.");
        setLoading(false);
        return;
      }

      try {
        console.log("🔑 Auth Token:", authToken); // ✅ Log Auth Token

        const response = await axios.get("https://app.webitservices.com/api/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        console.log("✅ API Response:", response.data); // ✅ Log Response Data
        setUserProfile(response.data);
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        setError("Failed to load profile. Please try again.");
      } finally {
        console.log("🔄 Setting loading to false...");
        setLoading(false); // ✅ Ensure loading is stopped
      }
    };

    fetchUserProfile();
  }, [authToken]); // ✅ Only runs when `authToken` changes

  // ✅ Loading Indicator
  if (loading) {
    console.log("⏳ Profile is loading...");
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" height="80vh">
          <CircularProgress color="info" />
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  // ✅ Error Handling UI
  if (error) {
    console.log("🚨 Error encountered:", error);
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" height="80vh">
          <MDTypography variant="h6" color="error">{error}</MDTypography>
        </MDBox>
        <Footer />
      </DashboardLayout>
    );
  }

  console.log("✅ Rendering profile page...");
  console.log("👤 User Profile Data:", userProfile);

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

            {/* Profile Info */}
            <Grid item xs={12} md={6} xl={4} sx={{ display: "flex" }}>
              <Divider orientation="vertical" sx={{ ml: -2, mr: 1 }} />
              <ProfileInfoCard
                title="Profile Information"
                description={`Hi, I’m ${userProfile?.name}. Welcome to your profile page!`}
                info={{
                  fullName: userProfile?.name || "N/A",
                  mobile: userProfile?.mobile || "N/A",
                  email: userProfile?.email || "N/A",
                  location: userProfile?.location || "N/A",
                  organization: userProfile?.organization?.name || "N/A",
                }}
                social={[
                  { link: "https://www.facebook.com", icon: <FacebookIcon />, color: "facebook" },
                  { link: "https://twitter.com", icon: <TwitterIcon />, color: "twitter" },
                  { link: "https://www.instagram.com", icon: <InstagramIcon />, color: "instagram" },
                ]}
                action={{ route: "/edit-profile", tooltip: "Edit Profile" }}
                shadow={false}
              />
              <Divider orientation="vertical" sx={{ mx: 0 }} />
            </Grid>
          </Grid>
        </MDBox>

        {/* Projects Section */}
        <MDBox pt={2} px={2} lineHeight={1.25}>
          <MDTypography variant="h6" fontWeight="medium">
            Projects
          </MDTypography>
          <MDBox mb={1}>
            <MDTypography variant="button" color="text">
              Your recent projects
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* User Projects */}
        <MDBox p={2}>
          <Grid container spacing={6}>
            {[homeDecor1, homeDecor2, homeDecor3, homeDecor4].map((image, index) => (
              <Grid item xs={12} md={6} xl={3} key={index}>
                <DefaultProjectCard
                  image={image}
                  label={`Project #${index + 1}`}
                  title={`Project Title ${index + 1}`}
                  description="A sample project description."
                  action={{ type: "internal", route: `/projects/${index + 1}`, color: "info", label: "View Project" }}
                  authors={[{ image: team1, name: "John Doe" }, { image: team2, name: "Jane Smith" }]}
                />
              </Grid>
            ))}
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default UserProfile;
