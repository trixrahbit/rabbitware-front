
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate hook

import { Divider } from "@mui/material";
// react-router-dom components
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import MuiLink from "@mui/material/Link";

// @mui icons
import FacebookIcon from "@mui/icons-material/Facebook";
import GitHubIcon from "@mui/icons-material/GitHub";
import GoogleIcon from "@mui/icons-material/Google";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import BasicLayout from "layouts/authentication/components/BasicLayout";

// Images
import bgImage from "assets/images/bg-sign-in-basic.jpeg";
import {useAuth} from "../../../../context/AuthContext";

function Basic() {
  const [email, setEmail] = useState(""); // Add state for email
  const [password, setPassword] = useState(""); // Add state for password
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth(); // Destructure the login method from your context
  const navigate = useNavigate();
  const handleSetRememberMe = () => setRememberMe(!rememberMe);

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const response = await fetch("https://app.webitservices.com:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json(); // Make sure this line correctly parses the JSON response

    if (data.access_token && data.user) {
      console.log("Login successful", data);
      // Now, use your context's login function, assuming it can handle both token and user info
      login(data.access_token, data.user); // Make sure your login function accepts both token and user

      navigate("/dashboards/analytics"); // Navigate to dashboard or desired route
    } else {
      console.error("Token or user information is missing in response");
      // Handle the missing token/user information error
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed. Please try again.");
  }
};

 return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="info"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Sign in
          </MDTypography>
          <Grid container spacing={3} justifyContent="center" sx={{ mt: 1, mb: 2 }}>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <FacebookIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GitHubIcon color="inherit" />
              </MDTypography>
            </Grid>
            <Grid item xs={2}>
              <MDTypography component={MuiLink} href="#" variant="body1" color="white">
                <GoogleIcon color="inherit" />
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <Divider>Hello</Divider>
          <MDBox component="form" role="form" onSubmit={handleSubmit}> {/* Add onSubmit handler */}
            <MDBox mb={2}>
              <MDInput type="email" label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Password" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                fontWeight="regular"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}
              >
                &nbsp;&nbsp;Remember me
              </MDTypography>

            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                sign in
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Don&apos;t have an account?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-up/cover"
                  variant="button"
                  color="info"
                  fontWeight="medium"
                  textGradient
                >
                  Sign up
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
