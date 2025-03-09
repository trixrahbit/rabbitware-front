import React from "react";
import Draggable from "react-draggable";
import { Modal, Paper, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";

const TicketDetailsModal = ({ ticket, open, onClose }) => {
  return (
    <Modal open={open} onClose={onClose} aria-labelledby="ticket-modal">
      <Draggable>
        <Paper
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            padding: "20px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          }}
        >
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{ticket.title}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </MDBox>
          <Typography variant="subtitle1" color="textSecondary">
            Status: {ticket.status}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Priority: {ticket.priority}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Impact: {ticket.impact}
          </Typography>
          <Typography variant="body1" mt={2}>
            {ticket.description}
          </Typography>
        </Paper>
      </Draggable>
    </Modal>
  );
};

export default TicketDetailsModal;
