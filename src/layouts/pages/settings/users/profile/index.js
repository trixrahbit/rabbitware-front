import React, { useEffect, useState } from "react";
import { useAuth } from "context/AuthContext";
import axios from "axios";

// MUI Components
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

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
  const { authToken, user } = useAuth();
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get("https://app.webitservices.com/api/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserProfile(response.data);
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
      }
      setLoading(false);
    };

    if (authToken) {
      fetchUserProfile();
    }
  }, [authToken]);

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
                description={`Hi, I’m ${userProfile.name}. Welcome to your profile page!`}
                info={{
                  fullName: userProfile.name || "N/A",
                  mobile: userProfile.mobile || "N/A",
                  email: userProfile.email || "N/A",
                  location: userProfile.location || "N/A",
                  organization: userProfile.organization?.name || "N/A",
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
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor1}
                label="Project #1"
                title="Modern Design"
                description="A cutting-edge design project."
                action={{ type: "internal", route: "/projects/1", color: "info", label: "View Project" }}
                authors={[{ image: team1, name: "John Doe" }, { image: team2, name: "Jane Smith" }]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor2}
                label="Project #2"
                title="Tech Platform"
                description="Building a new AI-driven platform."
                action={{ type: "internal", route: "/projects/2", color: "info", label: "View Project" }}
                authors={[{ image: team3, name: "Alice Brown" }, { image: team4, name: "Bob Martin" }]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor3}
                label="Project #3"
                title="Marketing Campaign"
                description="A new campaign for a major client."
                action={{ type: "internal", route: "/projects/3", color: "info", label: "View Project" }}
                authors={[{ image: team1, name: "John Doe" }, { image: team3, name: "Alice Brown" }]}
              />
            </Grid>
            <Grid item xs={12} md={6} xl={3}>
              <DefaultProjectCard
                image={homeDecor4}
                label="Project #4"
                title="E-commerce Revamp"
                description="A redesign for a global e-commerce site."
                action={{ type: "internal", route: "/projects/4", color: "info", label: "View Project" }}
                authors={[{ image: team2, name: "Jane Smith" }, { image: team4, name: "Bob Martin" }]}
              />
            </Grid>
          </Grid>
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default UserProfile;
