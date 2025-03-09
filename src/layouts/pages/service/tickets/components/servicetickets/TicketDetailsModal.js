import React, { useRef } from "react";
import Draggable from "react-draggable";
import { Modal, Paper, Typography, IconButton, Backdrop, Fade } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MDBox from "components/MDBox";

const TicketDetailsModal = ({ ticket, open, onClose }) => {
  const dragRef = useRef(null); // Reference for Draggable component

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
      aria-labelledby="ticket-modal-title"
      aria-describedby="ticket-modal-description"
    >
      <Fade in={open}>
        <Draggable handle=".modal-header" cancel={'[class*="MuiDialogContent-root"]'}>
          <Paper
            ref={dragRef} // Correctly referencing the Paper for Draggable
            elevation={3}
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
            }}
          >
            {/* Modal Header - Draggable */}
            <MDBox
              className="modal-header"
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ cursor: "move", borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}
            >
              <Typography variant="h6" id="ticket-modal-title">
                {ticket?.title || "No Title"}
              </Typography>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </MDBox>

            {/* Ticket Details */}
            <Typography id="ticket-modal-description" variant="body1">
              <strong>Status:</strong> {ticket?.status || "Unknown"}
            </Typography>
            <Typography variant="body1">
              <strong>Priority:</strong> {ticket?.priority || "Unassigned"}
            </Typography>
            <Typography variant="body1">
              <strong>Impact:</strong> {ticket?.impact || "Unspecified"}
            </Typography>
            <Typography variant="body2" mt={2}>
              {ticket?.description || "No Description Available"}
            </Typography>
          </Paper>
        </Draggable>
      </Fade>
    </Modal>
  );
};

export default TicketDetailsModal;
