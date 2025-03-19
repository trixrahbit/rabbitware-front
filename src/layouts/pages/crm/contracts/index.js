import React, { useState } from "react";
import { Card, Grid, Box, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import MDButton from "components/MDButton";
import ContractData from "./components/ContractData"; // Adjust the path as necessary
import ContractWizardModal from "./components/ContractWizard"; // New wizard modal
import axios from "axios";

const ContractsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const contractFilters = [
    { key: "all", label: "All Contracts" },
    // Additional filters (e.g., active, expired) can be added here.
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={4} pb={3} sx={{ width: "100%", maxWidth: "1400px", mx: "auto" }}>
        <Grid container spacing={2}>
          {/* Left Column: Contracts Filters */}
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h5" fontWeight="bold" mb={2}>
                Contract Filters
              </MDTypography>
              <List>
                {contractFilters.map((filter) => (
                  <React.Fragment key={filter.key}>
                    <ListItem
                      button
                      selected={selectedFilter === filter.key}
                      onClick={() => setSelectedFilter(filter.key)}
                    >
                      <ListItemText primary={filter.label} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Right Column: Contracts Table */}
          <Grid item xs={9}>
            <MDBox
              mb={2}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MDTypography
                variant="h3"
                fontWeight="bold"
                color="primary"
                sx={{
                  fontFamily: `"Poppins", sans-serif`,
                  background: "linear-gradient(to right, #2E7D32, #66BB6A)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "glow 1.5s infinite alternate",
                }}
              >
                📋 Contract Management
              </MDTypography>
              <Tooltip title="Create New Contract">
                <MDButton
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => setIsWizardOpen(true)}
                  sx={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    padding: "12px 24px",
                    background: "linear-gradient(90deg, #388E3C, #43A047)",
                    "&:hover": { background: "#388E3C" },
                    borderRadius: "12px",
                    transition: "all 0.3s ease-in-out",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  + New Contract
                </MDButton>
              </Tooltip>
            </MDBox>
            <ContractData selectedFilter={selectedFilter} />
          </Grid>
        </Grid>
      </MDBox>

      {isWizardOpen && (
        <ContractWizardModal
          open={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={(newContract) => {
            // Refresh the contract list or update state as needed.
            setIsWizardOpen(false);
          }}
        />
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default ContractsPage;
