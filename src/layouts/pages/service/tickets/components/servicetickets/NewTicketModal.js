import React, { useState } from "react";
import axios from "axios";
import { Modal, Box, TextField, Button, Typography } from "@mui/material";

const NewTicketModal = ({ open, onClose, onTicketCreated }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleCreateTicket = () => {
    const newTicket = {
      title: title,
      description: description,
      client_id: 1, // Replace with actual client ID
      priority: 3, // Default priority
    };

    axios
      .post("https://app.webitservices.com/api/tickets", newTicket)
      .then((response) => {
        onTicketCreated(response.data); // Pass new ticket back to parent
        onClose(); // Close the modal
      })
      .catch((error) => console.error("Error creating ticket:", error));
  };

  return (
    <Modal open={open} onClose={onClose}>
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
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>Create New Ticket</Typography>
        <TextField
          fullWidth
          label="Title"
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handleCreateTicket} sx={{ mr: 2 }}>
          Create
        </Button>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default NewTicketModal;