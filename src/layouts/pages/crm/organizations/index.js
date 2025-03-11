import React, { useState, useEffect } from "react";

// Material Dashboard 2 PRO React components and layout
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
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";

// Custom components
import OrgCountCard from "./components/stats/orgCountCard";
import OrganizationsData from "./components/organizationsdata";
import ComplexStatisticsCard from "../../../../examples/Cards/StatisticsCards/ComplexStatisticsCard";
import AddOrgModal from "./components/AddOrgModal";

const OrganizationsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Statistics Cards */}
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <OrgCountCard />
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
                icon="group"
                title="New Organizations"
                count="+5"
                percentage={{ color: "success", amount: "+2%", label: "than last week" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="info"
                icon="trending_up"
                title="Growth Rate"
                count="4.2%"
                percentage={{ color: "success", amount: "", label: "This quarter" }}
              />
            </MDBox>
          </Grid>
        </Grid>

        {/* Organizations Table with Add Button */}
        <MDBox pt={4} pb={2} position="relative">
          <Card sx={{ p: 3, boxShadow: 3 }}>
            <Grid container justifyContent="space-between" alignItems="center" mb={2}>
              <Grid item>
                <MDTypography variant="h4" fontWeight="medium">
                  Organizations
                </MDTypography>
                <MDTypography variant="body2" color="secondary">
                  Overview and management of your organizations.
                </MDTypography>
              </Grid>
              <Grid item>
                <Tooltip title="Add Organization">
                  <MDButton variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenModal}>
                    Add Organization
                  </MDButton>
                </Tooltip>
              </Grid>
            </Grid>
            {/* Organizations Data Table */}
            <OrganizationsData />
          </Card>
        </MDBox>
      </MDBox>

      {/* Add Organization Modal */}
      {isModalOpen && <AddOrgModal open={isModalOpen} onClose={handleCloseModal} />}

      <Footer />
    </DashboardLayout>
  );
};

export default OrganizationsPage;
