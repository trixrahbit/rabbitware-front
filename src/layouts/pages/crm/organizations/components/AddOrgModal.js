import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";

function AddOrgModal({ open, onClose, onSave }) {
  const [clientData, setClientData] = useState({
    name: "",
    domain: "",
    phone: "",
  });

  const handleChange = (e) => {
    setClientData({ ...clientData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    onSave(clientData);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Organization</DialogTitle>
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
          name="domain"
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

export default AddOrgModal;
