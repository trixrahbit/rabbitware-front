import React, { useState } from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import MDButton from "components/MDButton";

import TicketData from "./components/servicetickets/ticketdata";
import TicketDetailsModal from "./components/servicetickets/TicketDetailsModal";
import NewTicketModal from "./components/servicetickets/NewTicketModal";

const Tickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox pt={4} pb={3}>
        {/* 🎟️ Ticket Management Section */}
        <MDBox pt={4} pb={2}>
          <Card
            sx={{
              p: 4,
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
                  🎟️ Ticket Management
                </MDTypography>
                <MDTypography
                  variant="body1"
                  color="textSecondary"
                  sx={{ fontSize: "16px", fontWeight: 500 }}
                >
                  Track, manage, and resolve service tickets efficiently.
                </MDTypography>
              </Grid>

              {/* Right: Create Ticket Button */}
              <Grid item>
                <Tooltip title="Create New Ticket">
                  <MDButton
                    variant="contained"
                    color="success"
                    startIcon={<AddIcon />}
                    onClick={() => setIsNewTicketModalOpen(true)}
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
                    + New Ticket
                  </MDButton>
                </Tooltip>
              </Grid>
            </Grid>

            {/* 📋 Tickets Table */}
            <TicketData onTicketClick={handleTicketClick} />
          </Card>
        </MDBox>
      </MDBox>

      {/* 🎟️ Ticket Details Modal */}
      {modalOpen && selectedTicket && (
        <TicketDetailsModal ticket={selectedTicket} open={modalOpen} onClose={handleCloseModal} />
      )}

      {/* ➕ New Ticket Modal */}
      {isNewTicketModalOpen && <NewTicketModal open={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} />}

      <Footer />
    </DashboardLayout>
  );
};

export default Tickets;
