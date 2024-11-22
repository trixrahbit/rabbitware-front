import React, { useState } from "react";
import { Box, Typography, IconButton, TextField, Button, Paper, List, ListItem, ListItemText, Checkbox } from "@mui/material";
import { Add, Delete } from "@mui/icons-material";

const Checklist = ({ items, onItemsChange }) => {
  const [newItem, setNewItem] = useState("");

  const handleAddItem = () => {
    if (newItem.trim() !== "") {
      const updatedItems = [
        ...items,
        { id: items.length + 1, text: newItem, completed: false, completedBy: "", completedDate: "" }
      ];
      onItemsChange(updatedItems);
      setNewItem("");
    }
  };

  const handleToggleItem = (item) => {
    const updatedItems = items.map((i) =>
      i.id === item.id
        ? {
            ...i,
            completed: !i.completed,
            completedBy: !i.completed ? "Current User" : "", // Replace "Current User" with actual user data
            completedDate: !i.completed ? new Date().toLocaleDateString() : ""
          }
        : i
    );
    onItemsChange(updatedItems);
  };

  const handleDeleteItem = (item) => {
    const updatedItems = items.filter((i) => i.id !== item.id);
    onItemsChange(updatedItems);
  };

  return (
    <Paper sx={{ padding: 2, margin: 2 }}>
      <Typography variant="h6">Checklist</Typography>
      <Box sx={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
        <TextField
          label="New Item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          fullWidth
        />
        <IconButton onClick={handleAddItem} color="primary">
          <Add />
        </IconButton>
      </Box>
      <List>
        {items.map((item) => (
          <ListItem key={item.id} sx={{ textDecoration: item.completed ? "line-through" : "none" }}>
            <Checkbox
              checked={item.completed}
              onChange={() => handleToggleItem(item)}
            />
            <ListItemText
              primary={item.text}
              secondary={item.completed ? `Completed by ${item.completedBy} on ${item.completedDate}` : ""}
            />
            <IconButton onClick={() => handleDeleteItem(item)} color="secondary">
              <Delete />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default Checklist;
