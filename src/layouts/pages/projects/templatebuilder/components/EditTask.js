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

const EditTask = ({ open, onClose, taskId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetHours, setBudgetHours] = useState("");

  useEffect(() => {
    if (open && taskId) {
      fetchTaskData(taskId);
    }
  }, [open, taskId]);

  const fetchTaskData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/template/tasks/${id}`);
      const task = response.data;
      setName(task.name);
      setDescription(task.description);
      setStartDate(task.start_date);
      setEndDate(task.end_date);
      setBudgetHours(task.budget_hours);
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedTask = {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget_hours: budgetHours,
      };
      await axios.put(`http://localhost:8000/template/tasks/${taskId}`, updatedTask);
      onClose();
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Task</DialogTitle>
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
          label="Description"
          type="text"
          fullWidth
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

export default EditTask;
