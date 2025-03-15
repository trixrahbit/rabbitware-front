import React from "react";
import DashboardLayout from "../../../../examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "../../../../examples/Navbars/DashboardNavbar";
import Footer from "../../../../examples/Footer";
import MDBox from "../../../../components/MDBox";
import MDTypography from "../../../../components/MDTypography";
import ClientsData from "./components/clientsdata";
import ComplexStatisticsCard from "../../../../examples/Cards/StatisticsCards/ComplexStatisticsCard";
import Grid from "@mui/material/Grid";

const ClientsPage = () => {
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={6} pb={3}>
        {/* 🔹 Statistics Cards Section */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              icon="group"
              title="Total Clients"
              count="1,250"
              percentage={{ color: "success", amount: "+5%", label: "this month" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              icon="person_add"
              title="New Clients"
              count="+35"
              percentage={{ color: "success", amount: "+8%", label: "this week" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              icon="store"
              title="Revenue"
              count="$128k"
              percentage={{ color: "success", amount: "+12%", label: "this quarter" }}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              icon="pending_actions"
              title="Pending Requests"
              count="14"
              percentage={{ color: "error", amount: "-4%", label: "from last month" }}
            />
          </Grid>
        </Grid>

        {/* 🔹 Clients Table Section */}
        <MDBox pt={4} pb={2}>
          <MDTypography variant="h4" fontWeight="bold" mb={1}>
            Clients
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={3}>
            View and manage your client list with real-time updates.
          </MDTypography>
          <ClientsData />
        </MDBox>
      </MDBox>

      <Footer />
    </DashboardLayout>
  );
};

export default ClientsPage;
