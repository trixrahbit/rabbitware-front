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

const EditPhase = ({ open, onClose, phaseId }) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetHours, setBudgetHours] = useState("");

  useEffect(() => {
    if (open && phaseId) {
      fetchPhaseData(phaseId);
    }
  }, [open, phaseId]);

  const fetchPhaseData = async (id) => {
    try {
      const response = await axios.get(`https://app.webitservices.com/template/phases/${id}`);
      const phase = response.data;
      setName(phase.name);
      setStartDate(formatDate(phase.start_date));
      setEndDate(formatDate(phase.end_date));
      setBudgetHours(phase.budget_hours);
    } catch (error) {
      console.error("Error fetching phase data:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    try {
      const updatedPhase = {
        name,
        start_date: startDate,
        end_date: endDate,
        budget_hours: budgetHours,
      };
      await axios.put(`https://app.webitservices.com/template/phases/${phaseId}`, updatedPhase);
      onClose();
    } catch (error) {
      console.error("Error saving phase:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Phase</DialogTitle>
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

export default EditPhase;
