import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import axios from "axios";

const EditSprint = ({ open, onClose, sprintId }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetHours, setBudgetHours] = useState("");

  useEffect(() => {
    if (open && sprintId) {
      fetchSprintData(sprintId);
    }
  }, [open, sprintId]);

  const fetchSprintData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/template/sprints/${id}`);
      const sprint = response.data;
      setName(sprint.name);
      setStartDate(sprint.start_date);
      setEndDate(sprint.end_date);
      setBudgetHours(sprint.budget_hours);
    } catch (error) {
      console.error("Error fetching sprint data:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedSprint = {
        name,
        start_date: startDate,
        end_date: endDate,
        budget_hours: budgetHours,
      };
      await axios.put(`http://localhost:8000/template/sprints/${sprintId}`, updatedSprint);
      onClose();
    } catch (error) {
      console.error("Error saving sprint:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Sprint</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          type="text"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Start Date"
          type="date"
          fullWidth
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          margin="dense"
          label="End Date"
          type="date"
          fullWidth
          required
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          margin="dense"
          label="Budget Hours"
          type="number"
          fullWidth
          required
          value={budgetHours}
          onChange={(e) => setBudgetHours(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSprint;
