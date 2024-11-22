import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

const AddItemModal = ({ open, onClose, onSave, itemType }) => {
  const [itemData, setItemData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    budget_hours: "",
    phase_id: null,
    sprint_id: null,
    project_id: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItemData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onSave(itemData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add {itemType}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          name="name"
          fullWidth
          value={itemData.name}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Description"
          name="description"
          fullWidth
          value={itemData.description}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Start Date"
          name="start_date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={itemData.start_date}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="End Date"
          name="end_date"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
          value={itemData.end_date}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          label="Budget Hours"
          name="budget_hours"
          type="number"
          fullWidth
          value={itemData.budget_hours}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddItemModal;
