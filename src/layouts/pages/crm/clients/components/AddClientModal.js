import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useAuth } from "../../../../../context/AuthContext"; // ✅ Import useAuth

function AddClientModal({ open, onClose, onSave }) {
  const { organization, user } = useAuth(); // ✅ Get org & user from context
  const [clientData, setClientData] = useState({
    name: "",
    domain: "",  // ✅ Fix: Use `domain`, not `email`
    phone: "",
  });

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!organization?.id || !user?.id) {
      console.error("❌ Missing `organization_id` or `creator_id`!");
      return;
    }

    // ✅ Fix: Ensure `domain` & `creator_id` are included
    const clientPayload = {
      ...clientData,
      organization_id: organization.id,
      creator_id: user.id
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
          name="domain"  // ✅ Fix: Use `domain`, not `email`
          label="Domain"
          type="text"
          fullWidth
          variant="outlined"
          value={clientData.domain}
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
