import React, { useRef } from "react";
import Draggable from "react-draggable";
import { Modal, Paper, Typography, IconButton, Backdrop, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";

const TicketDetailsModal = ({ ticket, open, onClose }) => {
  const modalRef = useRef(null); // Correct ref for draggable component

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={open}>
        <Draggable handle=".modal-header">
          <Paper
            ref={modalRef} // Attach ref correctly
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
              <Typography variant="h5">{ticket.title || "No Title"}</Typography>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </MDBox>

            {/* Ticket Details */}
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Status:</strong> {ticket.status || "Unknown"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Priority:</strong> {ticket.priority || "Unassigned"}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              <strong>Impact:</strong> {ticket.impact || "Unspecified"}
            </Typography>
            <Typography variant="body1" mt={2}>
              {ticket.description || "No Description Available"}
            </Typography>
          </Paper>
        </Draggable>
      </Fade>
    </Modal>
  );
};

export default TicketDetailsModal;
