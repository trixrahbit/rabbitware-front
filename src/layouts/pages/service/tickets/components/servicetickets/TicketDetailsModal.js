import React, { useRef } from "react";
import Draggable from "react-draggable";
import { Modal, Paper, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";

const TicketDetailsModal = ({ ticket, open, onClose }) => {
  const modalRef = useRef(null); // Reference for the draggable component

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="ticket-modal">
      <Draggable nodeRef={modalRef} handle=".modal-header">
        <Paper
          ref={modalRef} // Attach the reference to the Paper component
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            padding: "20px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            backgroundColor: "white",
          }}
        >
          {/* Draggable Header */}
          <MDBox className="modal-header" display="flex" justifyContent="space-between" alignItems="center" sx={{ cursor: "move" }}>
            <Typography variant="h5">{ticket.title}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </MDBox>

          {/* Ticket Details */}
          <Typography variant="subtitle1" color="textSecondary">
            <strong>Status:</strong> {ticket.status}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            <strong>Priority:</strong> {ticket.priority}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            <strong>Impact:</strong> {ticket.impact}
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
