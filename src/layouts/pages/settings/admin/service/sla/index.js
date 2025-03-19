import React, { useState } from "react";
import { Card, Grid, Box, Tooltip, IconButton } from "@mui/material";
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
import SLAData from "./components/SLAData";
import NewSLAModal from "./components/NewSLAModal"; // Create this modal for SLA creation/editing

const SLAPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isNewSLAModalOpen, setIsNewSLAModalOpen] = useState(false);
  const slaFilters = [
    { key: "all", label: "All SLAs" },
    // You can add additional filters/categories here
  ];

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={4} pb={3}>
        <Grid container spacing={2}>
          {/* Left Column: SLA Filters */}
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h5" fontWeight="bold" mb={2}>
                SLA Filters
              </MDTypography>
              <List>
                {slaFilters.map((filter) => (
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

          {/* Right Column: SLA Table */}
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
                📋 SLA Management
              </MDTypography>
              <Tooltip title="Create New SLA">
                <MDButton
                  variant="contained"
                  color="success"
                  startIcon={<AddIcon />}
                  onClick={() => setIsNewSLAModalOpen(true)}
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
                  + New SLA
                </MDButton>
              </Tooltip>
            </MDBox>
            {/* SLAData receives selectedFilter as prop for filtering */}
            <SLAData selectedFilter={selectedFilter} />
          </Grid>
        </Grid>
      </MDBox>

      {isNewSLAModalOpen && (
        <NewSLAModal open={isNewSLAModalOpen} onClose={() => setIsNewSLAModalOpen(false)} />
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default SLAPage;