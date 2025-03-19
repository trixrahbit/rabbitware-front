import React, { useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import ClientsList from "../clients/components/clientsList"; // ✅ Import Clients List
import ContactsList from "./components/ContactsList"; // ✅ Import Contacts Table
import NewContactModal from "./components/NewContactModal"; // ✅ Add Contact Modal

const ContactsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // ✅ Store selected client

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox
        pt={4}
        pb={3}
        sx={{
          background: "linear-gradient(135deg, #ADE792 0%, #3BB273 100%)",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0px 15px 30px rgba(0, 0, 0, 0.2)",
        }}
      >
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
            {/* 🔹 Header Section */}
            <Grid container justifyContent="space-between" alignItems="center" mb={3}>
              <Grid item>
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
                  👥 Clients & Contacts
                </MDTypography>
                <MDTypography
                  variant="body1"
                  color="secondary"
                  sx={{ fontSize: "16px", fontWeight: 500 }}
                >
                  Manage clients and their associated contacts.
                </MDTypography>
              </Grid>

              {/* ➕ Add Contact Button */}
              <Grid item>
                <Tooltip title="Add Contact">
                  <MDButton
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={handleOpenModal}
                    disabled={!selectedClient} // Disable if no client is selected
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
                    + Add Contact
                  </MDButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* 📌 Two-Column Layout */}
            <Grid container spacing={3}>
              {/* Left Column: Clients List */}
              <Grid item xs={12} md={4}>
                <ClientsList onSelectClient={setSelectedClient} selectedClient={selectedClient} />
              </Grid>

              {/* Right Column: Contacts Table (For Selected Client) */}
              <Grid item xs={12} md={8}>
                {selectedClient ? (
                  <ContactsList clientId={selectedClient.id} />
                ) : (
                  <MDTypography variant="h6" color="textSecondary" textAlign="center">
                    Select a client to view contacts.
                  </MDTypography>
                )}
              </Grid>
            </Grid>
          </Card>
        </MDBox>
      </MDBox>

      {/* ➕ Add Contact Modal */}
      {isModalOpen && selectedClient && (
        <NewContactModal open={isModalOpen} onClose={handleCloseModal} clientId={selectedClient.id} />
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default ContactsPage;
