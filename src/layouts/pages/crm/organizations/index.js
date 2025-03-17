import React, { useState } from "react";

// Material Dashboard 2 PRO components and layout
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material UI components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";

// Custom components
import OrganizationsData from "./components/organizationsdata";
import AddOrgModal from "./components/AddOrgModal";

const OrganizationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox
        pt={4}
        pb={3}
        sx={{
          background: "linear-gradient(135deg, #ADE792 0%, #3BB273 100%)", // Green theme 🌿
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
        {/* 🏢 Organizations Management */}
        <MDBox pt={4} pb={2}>
          <Card
            sx={{
              p: 5,
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(10px)",
              boxShadow: "0px 8px 16px rgba(0, 0, 0, 0.15)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Grid container justifyContent="space-between" alignItems="center" mb={3}>
              <Grid item>
                <MDTypography
                  variant="h3"
                  fontWeight="bold"
                  color="primary"
                  sx={{
                    fontFamily: `"Poppins", sans-serif`,
                    background: "linear-gradient(to right, #2E7D32, #66BB6A)", // Green Gradient
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "glow 1.5s infinite alternate",
                  }}
                >
                  🏢 Organizations
                </MDTypography>
                <MDTypography
                  variant="body1"
                  color="secondary"
                  sx={{ fontSize: "16px", fontWeight: 500 }}
                >
                  View, manage, and track organizations seamlessly.
                </MDTypography>
              </Grid>

              {/* Right: Add Organization Button */}
              <Grid item>
                <Tooltip title="Add Organization">
                  <MDButton
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                    sx={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      padding: "12px 24px",
                      background: "linear-gradient(90deg, #388E3C, #43A047)", // Darker Green
                      "&:hover": { background: "#388E3C" },
                      borderRadius: "12px",
                      transition: "all 0.3s ease-in-out",
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    + Add Organization
                  </MDButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* 📋 Organizations Table */}
            <OrganizationsData />
          </Card>
        </MDBox>
      </MDBox>

      {/* ➕ Add Organization Modal */}
      {isModalOpen && <AddOrgModal open={isModalOpen} onClose={handleCloseModal} />}

      <Footer />
    </DashboardLayout>
  );
};

export default OrganizationsPage;
