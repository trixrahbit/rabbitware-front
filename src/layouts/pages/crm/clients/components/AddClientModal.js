import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useAuth } from "../../../../../context/AuthContext"; // ✅ Import useAuth

function AddClientModal({ open, onClose, onSave }) {
  const { organization, user } = useAuth();  // ✅ Get organization & user
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!organization?.id || !user?.id) {
      console.error("❌ Missing organization_id or creator_id!");
      return;
    }

    // Attach organization_id & creator_id before saving
    const clientPayload = {
      ...clientData,
      organization_id: organization.id,  // ✅ Ensure organization_id is included
      creator_id: user.id               // ✅ Ensure creator_id is included
    };

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
