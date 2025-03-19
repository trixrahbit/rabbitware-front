import React, { useState } from "react";
import { Card, Grid, Box, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ServiceBundleData from "./components/ServiceBundleData"; // Table for Service Bundles
import NewContractServiceBundleModal from "./components/NewContractServiceBundleModal";

const ServiceBundleIndex = () => {
  const [isNewBundleModalOpen, setIsNewBundleModalOpen] = useState(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={4} pb={3} sx={{ width: "100%", maxWidth: "1400px", mx: "auto" }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Card sx={{ p: 2 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <MDTypography variant="h5" fontWeight="bold" color="primary">
                  Service Bundles
                </MDTypography>
                <Tooltip title="Add New Bundle">
                  <MDButton
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => setIsNewBundleModalOpen(true)}
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
                    + New Bundle
                  </MDButton>
                </Tooltip>
              </MDBox>
              <ServiceBundleData />
            </Card>
          </Grid>
        </Grid>
      </MDBox>
      {isNewBundleModalOpen && (
        <NewContractServiceBundleModal
          open={isNewBundleModalOpen}
          onClose={() => setIsNewBundleModalOpen(false)}
          // Pass onBundleCreated callback as needed
        />
      )}
      <Footer />
    </DashboardLayout>
  );
};

export default ServiceBundleIndex;
