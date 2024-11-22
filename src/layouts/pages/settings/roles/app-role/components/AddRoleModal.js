import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';

const AddRoleModal = ({ open, onClose, onSave }) => {
  const [roleName, setRoleName] = useState('');

  const handleSave = () => {
    console.log("Role to save:", roleName);
    // Here you would replace this log with your actual save logic, e.g., an API call
    onSave(roleName);
    onClose(); // Close the modal after saving
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New Role</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Role Name"
          type="text"
          fullWidth
          variant="outlined"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddRoleModal;
