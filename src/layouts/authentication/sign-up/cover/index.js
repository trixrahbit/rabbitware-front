import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // react-router-dom components

// @mui material components
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Authentication layout components
import CoverLayout from "layouts/authentication/components/CoverLayout";

// Images
import bgImage from "assets/images/bg-sign-up-cover.jpeg";

function Cover() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate(); // Hook to navigate to different routes

const handleSubmit = async (event) => {
  event.preventDefault();

  if (!agreeTerms) {
    alert("You must agree to the terms and conditions.");
    return;
  }

  try {
    const response = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Ensure the payload matches the backend expectation
      body: JSON.stringify({
        name,
        email,
        password,
        agree_to_terms: agreeTerms, // Correct the field name to match the backend's expected schema
      }),
    });

    if (!response.ok) {
      // This will now capture HTTP status codes like 422 and log the server's response
      const errorData = await response.json();
      console.error("Registration error response:", errorData);
      throw new Error('Failed to register. Please try again.');
    }

    const data = await response.json();
    alert(data.message); // Show success message or handle accordingly
    navigate('/authentication/sign-in/cover'); // Navigate to sign-in page upon successful registration
  } catch (error) {
    console.error("Registration error:", error);
    alert("Registration failed. Please try again.");
  }
};


  return (
    <CoverLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="info"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            Join us today
          </MDTypography>
          <MDTypography display="block" variant="button" color="white" my={1}>
            Enter your email and password to register
          </MDTypography>
        </MDBox>
        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form" onSubmit={handleSubmit}>
            <MDBox mb={2}>
              <MDInput type="text" label="Name" variant="standard" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="email" label="Email" variant="standard" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            </MDBox>
            <MDBox mb={2}>
              <MDInput type="password" label="Password" variant="standard" fullWidth value={password} onChange={(e) => setPassword(e.target.value)} />
            </MDBox>
            <MDBox display="flex" alignItems="center" ml={-1}>
              <Checkbox checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
              <MDTypography variant="button" fontWeight="regular" color="text" sx={{ cursor: "pointer", userSelect: "none", ml: -1 }}>
                &nbsp;&nbsp;I agree to the&nbsp;
              </MDTypography>
              <MDTypography component="a" href="#" variant="button" fontWeight="bold" color="info" textGradient>
                Terms and Conditions
              </MDTypography>
            </MDBox>
            <MDBox mt={4} mb={1}>
              <MDButton type="submit" variant="gradient" color="info" fullWidth>
                sign up
              </MDButton>
            </MDBox>
            <MDBox mt={3} mb={1} textAlign="center">
              <MDTypography variant="button" color="text">
                Already have an account?{" "}
                <MDTypography component={Link} to="/authentication/sign-in/cover" variant="button" color="info" fontWeight="medium" textGradient>
                  Sign In
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default Cover;

