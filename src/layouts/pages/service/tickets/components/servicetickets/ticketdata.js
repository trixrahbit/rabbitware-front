import React, { useState, useEffect } from "react";
import axios from "axios";
import DataTable from "examples/Tables/DataTable"; // Ensure correct import
import { Modal, Box, Typography, IconButton } from "@mui/material";
import Draggable from "react-draggable"; // Enables modal dragging
import CloseIcon from "@mui/icons-material/Close";

// Define table columns
const ticketColumns = [
  { Header: "ID", accessor: "id", width: "10%" },
  { Header: "Title", accessor: "title", width: "20%" },
  { Header: "Status", accessor: "status", width: "15%" },
  { Header: "Priority", accessor: "priority", width: "15%" },
  { Header: "Impact", accessor: "impact", width: "15%" },
  { Header: "Description", accessor: "description", width: "25%" },
];

const TicketData = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    axios.get("https://app.webitservices.com/api/tickets")
      .then(response => {
        console.log("Tickets API Response:", response.data); // Debugging output
        const formattedTickets = response.data.map(ticket => ({
          id: ticket.id || "N/A",
          title: ticket.title || "No Title",
          status: ticket.status || "Unknown",
          priority: ticket.priority || "Unassigned",
          impact: ticket.impact || "Unspecified",
          description: ticket.description || "No Description Available",
        }));
        setTickets(formattedTickets);
      })
      .catch(error => console.error("Error fetching tickets:", error));
  }, []);

  // Handle ticket click to open modal
  const handleRowClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  // Close modal
  const handleClose = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <>
      <DataTable
        table={{
          columns: ticketColumns,
          rows: tickets.map(ticket => ({
            ...ticket,
            onClick: () => handleRowClick(ticket), // Make each row clickable
          })),
        }}
      />

      {/* Draggable Modal for Ticket Details */}
      <Modal open={modalOpen} onClose={handleClose}>
        <Draggable>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 400,
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: "8px",
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <CloseIcon />
            </IconButton>

            {selectedTicket && (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Ticket ID: {selectedTicket.id}
                </Typography>
                <Typography variant="subtitle1">
                  <strong>Title:</strong> {selectedTicket.title}
                </Typography>
                <Typography variant="body1">
                  <strong>Status:</strong> {selectedTicket.status}
                </Typography>
                <Typography variant="body1">
                  <strong>Priority:</strong> {selectedTicket.priority}
                </Typography>
                <Typography variant="body1">
                  <strong>Impact:</strong> {selectedTicket.impact}
                </Typography>
                <Typography variant="body2" sx={{ mt: 2 }}>
                  <strong>Description:</strong> {selectedTicket.description}
                </Typography>
              </>
            )}
          </Box>
        </Draggable>
      </Modal>
    </>
  );
};

export default TicketData;
