import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import { useAuth } from "../../../../../context/AuthContext"; // ✅ Import useAuth

function AddOrgModal({ open, onClose, onSave }) {
  const { user } = useAuth(); // ✅ Get user from context
  const [orgData, setOrgData] = useState({
    name: "",
    domain: "",
    phone: "",
  });

  const handleChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error("❌ Missing `creator_id`!");
      return;
    }

    // ✅ Ensure `creator_id` is included
    const orgPayload = { ...orgData, creator_id: user.id };

    console.log("📢 Submitting organization data:", orgPayload);
    onSave(orgPayload);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Organization</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Organization Name"
          type="text"
          fullWidth
          variant="outlined"
          value={orgData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="domain"
          label="Domain"
          type="text"
          fullWidth
          variant="outlined"
          value={orgData.domain}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="phone"
          label="Phone"
          type="text"
          fullWidth
          variant="outlined"
          value={orgData.phone}
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
