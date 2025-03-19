import React, { useState } from "react";
import axios from "axios";
import { Modal, Grid, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useAuth } from "../../../../../../../context/AuthContext";

const NewSLAModal = ({ open, onClose, onSLACreated }) => {
  const { authToken } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    response_time: "",
    resolution_time: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSLA = async () => {
    if (!authToken) return;
    if (!formData.name || !formData.response_time || !formData.resolution_time) {
      console.error("SLA Name, Response Time, and Resolution Time are required.");
      return;
    }
    const payload = { ...formData };

    try {
      await axios.post("https://app.webitservices.com/api/slas", payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("SLA Created Successfully!");
      if (onSLACreated) onSLACreated();
      onClose();
    } catch (error) {
      console.error("Error creating SLA:", error.response?.data || error.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems:"center", justifyContent:"center" }}>
      <MDBox sx={{ width: "600px", bgcolor: "background.paper", borderRadius: "8px", p: 3 }}>
        <MDTypography variant="h4" fontWeight="bold" textAlign="center" color="primary">
          New SLA
        </MDTypography>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="SLA Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Response Time"
              name="response_time"
              type="text"
              value={formData.response_time}
              onChange={handleChange}
              helperText="e.g. 1 hour"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Resolution Time"
              name="resolution_time"
              type="text"
              value={formData.resolution_time}
              onChange={handleChange}
              helperText="e.g. 4 hours"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <MDBox mt={3} display="flex" justifyContent="space-between">
          <MDButton variant="contained" color="success" onClick={handleCreateSLA}>
            Create SLA
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            Cancel
          </MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

export default NewSLAModal;
