import React, { useState } from "react";

// Material Dashboard 2 PRO React components and layout
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar";
import Footer from "../../../../examples/Footer";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import { TextField, InputAdornment, Card, CardContent, Grid, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClientsData from "./components/clientsdata";
import ComplexStatisticsCard from "../../../../examples/Cards/StatisticsCards/ComplexStatisticsCard";

const ClientsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="leaderboard"
                title="Today's Users"
                count="2,300"
                percentage={{ color: "success", amount: "+3%", label: "than last month" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Revenue"
                count="$34k"
                percentage={{ color: "success", amount: "+1%", label: "than yesterday" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="New Clients"
                count="+15"
                percentage={{ color: "success", amount: "", label: "This week" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="warning"
                icon="pending_actions"
                title="Pending Requests"
                count="7"
                percentage={{ color: "error", amount: "-5%", label: "from last month" }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Clients Table with Search and Filters */}
        <MDBox pt={4} pb={2} position="relative">
          <MDTypography variant="h4" fontWeight="medium" mb={2}>
            Clients
          </MDTypography>
          <MDTypography variant="body2" color="secondary" mb={3}>
            Overview and management of your client data.
          </MDTypography>

          {/* Search & Filter Card */}
          <Card sx={{ p: 2, boxShadow: 4, borderRadius: "12px", backgroundColor: "white", mb: 3 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                {/* Search Field */}
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Search Clients"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      backgroundColor: "#f5f5f5",
                      borderRadius: "8px",
                      "&:hover": { backgroundColor: "#eeeeee" },
                    }}
                  />
                </Grid>

                {/* Filter Button */}
                <Grid item xs={12} md={3}>
                  <Tooltip title="Filter Clients">
                    <MDButton
                      variant="contained"
                      color="primary"
                      startIcon={<FilterListIcon />}
                      sx={{
                        width: "100%",
                        backgroundColor: "#3F51B5",
                        "&:hover": { backgroundColor: "#303F9F" },
                      }}
                    >
                      Filter
                    </MDButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Clients Table */}
          <MDBox mt={3} p={2} boxShadow={2} borderRadius="12px" bgcolor="white">
            <ClientsData searchQuery={searchQuery} />
          </MDBox>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
};

export default ClientsPage;
