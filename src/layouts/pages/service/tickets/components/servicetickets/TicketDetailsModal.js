import React from "react";
import {
  Modal,
  Paper,
  Typography,
  IconButton,
  Backdrop,
  Fade,
  Grid,
  Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const TicketDetailsModal = ({ ticket, open, onClose }) => {
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
        <Paper
          elevation={3}
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "60%",
            p: 3,
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: "10px",
          }}
        >
          {/* Modal Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ borderBottom: "1px solid #ddd", pb: 1, mb: 2 }}
          >
            <Typography variant="h6" id="ticket-modal-title">
              {ticket?.title || "No Title"}
            </Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Ticket Layout Grid */}
          <Grid container spacing={2}>

            {/* Left Column - Ticket Info */}
            <Grid item xs={3} sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: "10px" }}>
              <Typography variant="body1"><strong>Status:</strong> {ticket?.status || "Unknown"}</Typography>
              <Typography variant="body1"><strong>Priority:</strong> {ticket?.priority || "Unassigned"}</Typography>
              <Typography variant="body1"><strong>Impact:</strong> {ticket?.impact || "Unspecified"}</Typography>
            </Grid>

            {/* Center Column - Ticket Title & Description */}
            <Grid item xs={6}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {ticket?.title || "No Title"}
              </Typography>
              <Typography variant="body2">
                {ticket?.description || "No Description Available"}
              </Typography>
            </Grid>

            {/* Right Column - Placeholder for Future Info */}
            <Grid item xs={3} sx={{ bgcolor: "#f5f5f5", p: 2, borderRadius: "10px" }}>
              <Typography variant="body1"><strong>Assigned To:</strong> John Doe</Typography>
              <Typography variant="body1"><strong>Created On:</strong> 2024-03-09</Typography>
              <Typography variant="body1"><strong>Due Date:</strong> 2024-03-15</Typography>
            </Grid>

          </Grid>
        </Paper>
      </Fade>
    </Modal>
  );
};

export default TicketDetailsModal;
