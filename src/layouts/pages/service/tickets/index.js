import React, { useState, useEffect } from "react";
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
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import axios from "axios";

import TicketData from "./components/servicetickets/ticketdata";
import TicketDetailsModal from "./components/servicetickets/TicketDetailsModal";
import NewTicketModal from "./components/servicetickets/NewTicketModal";

const Tickets = () => {
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [queues, setQueues] = useState([]);
  const [selectedQueue, setSelectedQueue] = useState(null);

  // Fetch queues on mount.
  useEffect(() => {
    axios
      .get("https://app.webitservices.com/api/queues")
      .then((response) => {
        setQueues(response.data);
      })
      .catch((error) => {
        console.error("Error fetching queues:", error);
      });
  }, []);

  const handleQueueSelect = (queueId) => {
    setSelectedQueue(queueId);
  };

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
        <Grid container spacing={2}>
          {/* Left Column: Queues List */}
          <Grid item xs={3}>
            <Card sx={{ p: 2 }}>
              <MDTypography variant="h5" fontWeight="bold" mb={2}>
                Queues
              </MDTypography>
              <List>
                {queues.map((queue) => (
                  <React.Fragment key={queue.id}>
                    <ListItem
                      button
                      selected={selectedQueue === queue.id}
                      onClick={() => handleQueueSelect(queue.id)}
                    >
                      <ListItemText primary={queue.name} />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Grid>

          {/* Right Column: Tickets Table */}
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
                🎟️ Ticket Management
              </MDTypography>
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
                    background: "linear-gradient(90deg, #388E3C, #43A047)",
                    "&:hover": { background: "#388E3C" },
                    borderRadius: "12px",
                    transition: "all 0.3s ease-in-out",
                    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.2)",
                  }}
                >
                  + New Ticket
                </MDButton>
              </Tooltip>
            </MDBox>
            {/* TicketData now receives selectedQueue as prop */}
            <TicketData onTicketClick={handleTicketClick} selectedQueue={selectedQueue} />
          </Grid>
        </Grid>
      </MDBox>

      {modalOpen && selectedTicket && (
        <TicketDetailsModal ticket={selectedTicket} open={modalOpen} onClose={handleCloseModal} />
      )}

      {isNewTicketModalOpen && (
        <NewTicketModal open={isNewTicketModalOpen} onClose={() => setIsNewTicketModalOpen(false)} />
      )}

      <Footer />
    </DashboardLayout>
  );
};

export default Tickets;
