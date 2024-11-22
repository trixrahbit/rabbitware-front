import React from 'react';
import { Grid, Card, Box, Button, Divider } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FormField from 'layouts/pages/account/components/FormField';

const ProjectDetails = ({ item, handleSave, navigate, setItem, itemType }) => {
  if (!itemType) {
    return null; // Return null or some fallback UI if itemType is undefined
  }

  return (
    <Card id="basic-info" sx={{ overflow: "visible" }}>
      <MDBox p={3}>
        <MDTypography variant="h5">Edit {itemType.slice(0, -1)}</MDTypography>
      </MDBox>
      <MDBox component="form" pb={3} px={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <FormField
              label="Name"
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12}>
            <FormField
              label="Description"
              value={item.description || ""}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
              fullWidth
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              label="Start Date"
              type="date"
              value={item.start_date || ""}
              onChange={(e) => setItem({ ...item, start_date: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              label="End Date"
              type="date"
              value={item.end_date || ""}
              onChange={(e) => setItem({ ...item, end_date: e.target.value })}
              fullWidth
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormField
              label="Budget Hours"
              type="number"
              value={item.budget_hours || ""}
              onChange={(e) => setItem({ ...item, budget_hours: e.target.value })}
              fullWidth
              margin="normal"
            />
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Box display="flex" justifyContent="space-between" mt={2}>
          <Button variant="contained" color="primary" onClick={handleSave}>Save</Button>
          <Button variant="contained" color="info" onClick={() => navigate(-1)}>Cancel</Button>
        </Box>
      </MDBox>
    </Card>
  );
};

export default ProjectDetails;
