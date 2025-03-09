import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, TextField } from '@mui/material';
import axios from 'axios';
import {useAuth} from "../../../../../../context/AuthContext"; // Make sure to install axios

const ITEM_HEIGHT = 68;
const ITEM_PADDING_TOP = 89;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const AddUserModal = ({ open, onClose, onSave }) => {
    const { currentOrg } = useAuth(); // Access currentOrg from your AuthContext
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);

useEffect(() => {
  const orgId = currentOrg?.id; // Make sure `currentOrg` is defined and contains `id`
  if (!orgId) {
    console.error('Organization ID is not set, cannot fetch roles.');
    return; // Early return if orgId is not available
  }
  // Correctly use template literals with backticks for variable interpolation
  axios.get(`https://app.webitservices.com/api/organizations/${orgId}/roles`)
    .then(response => {
      setAvailableRoles(response.data.map(role => role.name)); // Assuming the response is an array of role objects
    })
    .catch(error => console.error('Failed to fetch roles:', error));
}, [currentOrg]); // Depend on `currentOrg` to refetch roles when it changes


  const handleSave = () => {
    const userData = { username, email, roles: selectedRoles };
    onSave(userData);
    onClose();
  };

const handleChange = (event) => {
  const value = event.target.value;
  setSelectedRoles(typeof value === 'string' ? value.split(',') : value);
};


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="username"
          label="Username"
          type="text"
          fullWidth
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="dense"
          id="email"
          label="Email Address"
          type="email"
          fullWidth
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
<TextField
  margin="dense"
  id="roles"
  label="Roles"
  type="text"
  fullWidth
  variant="outlined"
  select
  SelectProps={{
    multiple: true,
    value: selectedRoles,
    onChange: handleChange,
    renderValue: (selected) => selected.join(', '),
    MenuProps: {
      PaperProps: {
        style: {
          maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
          width: 250,
        },
      },
    },
  }}
  // Adjustments here aim to ensure the select's initial height matches other inputs
  sx={{
    '& .MuiInputBase-root': {
      height: '56px', // Ensure the root height matches other fields
    },
    '& .MuiOutlinedInput-input': {
      height: '56px', // Match input height to ensure consistency
      padding: '10px 14px', // Adjust padding to vertically center the text
    },
    '& .MuiSelect-select': {
      height: '56px', // Match the select field height
      display: 'flex',
      alignItems: 'center',
    },
  }}
>
  {availableRoles.map((role) => (
    <MenuItem key={role} value={role}>
      {role}
    </MenuItem>
  ))}
</TextField>


      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;

