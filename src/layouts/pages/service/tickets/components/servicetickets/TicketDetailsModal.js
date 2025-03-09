import React, { useRef } from "react";
import { Modal, Paper, Typography, IconButton, Backdrop, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";

const TicketDetailsModal = ({ ticket, open, onClose }) => {
  const modalRef = useRef(null); // ✅ Ensure ref is correctly set

  if (!ticket) return null; // ✅ Prevents rendering when there's no ticket

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      disableEnforceFocus // ✅ Prevents MUI's focus trap from breaking
      disableAutoFocus // ✅ Ensures modal doesn't auto-focus incorrectly
    >
      <Fade in={open}>
        <MDBox
          ref={modalRef} // ✅ Correct ref handling
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "50%",
            p: 3,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: "10px",
            outline: "none", // ✅ Prevents focus issues
          }}
        >
          {/* Modal Header */}
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}
          >
            <Typography variant="h6">{ticket.title || "No Title"}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </MDBox>

          {/* Ticket Details */}
          <Typography variant="body1"><strong>Status:</strong> {ticket.status || "Unknown"}</Typography>
          <Typography variant="body1"><strong>Priority:</strong> {ticket.priority || "Unassigned"}</Typography>
          <Typography variant="body1"><strong>Impact:</strong> {ticket.impact || "Unspecified"}</Typography>
          <Typography variant="body2" mt={2}>{ticket.description || "No Description Available"}</Typography>
        </MDBox>
      </Fade>
    </Modal>
  );
};

export default TicketDetailsModal;
