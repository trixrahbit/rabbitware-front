import React, { useState } from "react";
import axios from "axios";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { Box, Button, TextField } from "@mui/material";

// Material Dashboard 2 PRO React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { useParams } from "react-router-dom";

const ChecklistCreator = () => {
  const { itemId } = useParams();
  const [checklistItems, setChecklistItems] = useState([{ title: "" }]);

  const handleAddItem = () => {
    setChecklistItems([...checklistItems, { title: "" }]);
  };

  const handleItemChange = (index, event) => {
    const newChecklistItems = [...checklistItems];
    newChecklistItems[index].title = event.target.value;
    setChecklistItems(newChecklistItems);
  };

  const handleSaveChecklist = async () => {
    try {
      const itemType = window.location.pathname.includes("story") ? "story_id" : "task_id";

      const response = await axios.post('https://app.webitservices.com/api/checklists/', {
        [itemType]: itemId,
        items: checklistItems.map(item => ({ description: item.title })),
      });

      console.log('Checklist saved:', response.data);
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  return (
    <Card id="checklist-creator" sx={{ overflow: "visible" }}>
      <MDBox p={3}>
        <MDTypography variant="h5">Create Checklist</MDTypography>
      </MDBox>
      <MDBox pb={3} px={3}>
        <Grid container spacing={2}>
          {checklistItems.map((item, index) => (
            <Grid item xs={12} key={index}>
              <TextField
                label={`Item ${index + 1}`}
                value={item.title}
                onChange={(e) => handleItemChange(index, e)}
                fullWidth
                margin="normal"
              />
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button variant="contained" color="info" onClick={handleAddItem}>
              Add Item
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" color="info" onClick={handleSaveChecklist}>
              Save Checklist
            </Button>
          </Grid>
        </Grid>
      </MDBox>
    </Card>
  );
};

export default ChecklistCreator;
