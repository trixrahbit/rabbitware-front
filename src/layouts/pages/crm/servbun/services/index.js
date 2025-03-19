import React, { useState } from "react";
import { Card, Grid, Box, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ServiceData from "./components/ServiceData"; // Table for Contract Services
import NewContractServiceModal from "./components/NewContractServiceModal"; // Modal to add a new service

const ServiceIndex = () => {
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={4} pb={3} sx={{ width: "100%", maxWidth: "1400px", mx: "auto" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h5" fontWeight="bold" color="primary">
                  Contract Services
                </MDTypography>
                <Tooltip title="Add New Service">
                  <MDButton
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => setIsNewServiceModalOpen(true)}
                    sx={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      padding: "8px 16px",
                      background: "linear-gradient(90deg, #388E3C, #43A047)",
                      "&:hover": { background: "#388E3C" },
                      borderRadius: "12px",
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    + New Service
                  </MDButton>
                </Tooltip>
              </MDBox>
              <ServiceData />
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {isNewServiceModalOpen && (
        <NewContractServiceModal
          open={isNewServiceModalOpen}
          onClose={() => setIsNewServiceModalOpen(false)}
          // onServiceCreated callback to refresh the service list as needed
        />
      )}
      <Footer />
    </DashboardLayout>
  );
};

export default ServiceIndex;
