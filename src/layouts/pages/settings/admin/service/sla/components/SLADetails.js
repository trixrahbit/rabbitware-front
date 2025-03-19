import React, { useState } from "react";
import axios from "axios";
import { Modal, TextField, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useAuth } from "../../../../../../../context/AuthContext";

const SLADetails = ({ open, sla, onClose, onSLAUpdated, onSLADeleted }) => {
  const { authToken } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: sla?.name || "",
    response_time: sla?.response_time || "",
    resolution_time: sla?.resolution_time || "",
    description: sla?.description || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.put(
        `https://app.webitservices.com/api/slas/${sla.id}`,
        formData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("SLA updated successfully", response.data);
      setEditMode(false);
      if (onSLAUpdated) onSLAUpdated(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating SLA:", error.response?.data || error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`https://app.webitservices.com/api/slas/${sla.id}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("SLA deleted successfully");
      if (onSLADeleted) onSLADeleted(sla.id);
      onClose();
    } catch (error) {
      console.error("Error deleting SLA:", error.response?.data || error.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
      <MDBox
        sx={{
          width: { xs: "90%", sm: "600px" },
          bgcolor: "background.paper",
          borderRadius: "16px",
          p: 4,
          boxShadow: 24,
        }}
      >
        <MDTypography variant="h4" fontWeight="bold" textAlign="center" color="primary" mb={3}>
          SLA Details
        </MDTypography>
        {editMode ? (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="SLA Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Response Time"
                  name="response_time"
                  value={formData.response_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="e.g., 1 hour"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Resolution Time"
                  name="resolution_time"
                  value={formData.resolution_time}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  helperText="e.g., 4 hours"
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
            <MDBox mt={3} display="flex" justifyContent="flex-end">
              <MDButton variant="contained" color="success" onClick={handleSave} sx={{ mr: 2 }}>
                Save
              </MDButton>
              <MDButton variant="outlined" color="error" onClick={() => setEditMode(false)}>
                Cancel Edit
              </MDButton>
            </MDBox>
          </>
        ) : (
          <>
            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
              Name:
            </MDTypography>
            <MDTypography variant="body1" mb={2}>
              {sla.name}
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
              Response Time:
            </MDTypography>
            <MDTypography variant="body1" mb={2}>
              {sla.response_time}
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
              Resolution Time:
            </MDTypography>
            <MDTypography variant="body1" mb={2}>
              {sla.resolution_time}
            </MDTypography>
            <MDTypography variant="h6" fontWeight="bold" gutterBottom>
              Description:
            </MDTypography>
            <MDTypography variant="body1" mb={2}>
              {sla.description}
            </MDTypography>
            <MDBox mt={3} display="flex" justifyContent="flex-end">
              <MDButton variant="contained" color="primary" onClick={() => setEditMode(true)} sx={{ mr: 2 }}>
                Edit
              </MDButton>
              <MDButton variant="contained" color="error" onClick={handleDelete}>
                Delete
              </MDButton>
            </MDBox>
          </>
        )}
      </MDBox>
    </Modal>
  );
};

export default SLADetails;
