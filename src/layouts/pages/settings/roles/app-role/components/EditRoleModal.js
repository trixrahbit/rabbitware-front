import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const EditRoleModal = ({ open, onClose, role, onSave }) => {
  const [roleName, setRoleName] = useState('');

  useEffect(() => {
    // When the role prop changes, update the roleName state
    if (role) {
      setRoleName(role.name);
    }
  }, [role]);

  const handleSave = () => {
    // Call the onSave prop with the new role name
    onSave(role.id, roleName);
    onClose(); // Close the modal
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit Role</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="name"
          label="Role Name"
          type="text"
          fullWidth
          variant="standard"
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

export default EditRoleModal;
