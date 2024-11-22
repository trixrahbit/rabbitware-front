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

const EditStory = ({ open, onClose, storyId }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budgetHours, setBudgetHours] = useState("");

  useEffect(() => {
    if (open && storyId) {
      fetchStoryData(storyId);
    }
  }, [open, storyId]);

  const fetchStoryData = async (id) => {
    try {
      const response = await axios.get(`http://localhost:8000/template/stories/${id}`);
      const story = response.data;
      setName(story.name);
      setDescription(story.description);
      setStartDate(story.start_date);
      setEndDate(story.end_date);
      setBudgetHours(story.budget_hours);
    } catch (error) {
      console.error("Error fetching story data:", error);
    }
  };

  const handleSave = async () => {
    try {
      const updatedStory = {
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        budget_hours: budgetHours,
      };
      await axios.put(`http://localhost:8000/template/stories/${storyId}`, updatedStory);
      onClose();
    } catch (error) {
      console.error("Error saving story:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Story</DialogTitle>
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

export default EditStory;
