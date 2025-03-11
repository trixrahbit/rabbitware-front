import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";

function AddClientModal({ open, onClose, onSave }) {
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

const handleSubmit = async () => {
  if (!clientData.name || !clientData.email || !clientData.phone) {
    console.error("❌ Missing required fields!");
    return;
  }

  // Ensure the organization ID is attached
  const clientPayload = { ...clientData, organization_id: organization?.id };

  console.log("📢 Submitting client data:", clientPayload);

  onSave(clientPayload);
};


  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Client</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Name"
          type="text"
          fullWidth
          variant="outlined"
          value={clientData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="email"
          label="Email"
          type="email"
          fullWidth
          variant="outlined"
          value={clientData.email}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="phone"
          label="Phone"
          type="text"
          fullWidth
          variant="outlined"
          value={clientData.phone}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddClientModal;
