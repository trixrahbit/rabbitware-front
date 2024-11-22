import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useClients } from "context/ClientsContext"; // Adjust the import path as needed

const AddProjectModal = ({ open, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const { clients } = useClients();
  const theme = useTheme();

  const handleSave = () => {
    onSave({ name, description, client_id: clientId });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        Add New Project
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <TextField
          autoFocus
          margin="dense"
          label="Project Name"
          type="text"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        />
        <TextField
          margin="dense"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          sx={{
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        />
        <TextField
          margin="dense"
          label="Client"
          select
          fullWidth
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          sx={{
            "& .MuiInputBase-root": {
              height: "56px", // Set a fixed height for the dropdown
              display: "flex",
              alignItems: "center",
            },
            "& .MuiInputBase-input": {
              color: theme.palette.text.primary,
            },
            "& .MuiInputLabel-root": {
              color: theme.palette.text.secondary,
            },
          }}
        >
          {clients.map((client) => (
            <MenuItem key={client.id} value={client.id}>
              {client.name}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions
        sx={{
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddProjectModal;
