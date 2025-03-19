import React, { useState } from "react";
import { Modal, Grid, TextField } from "@mui/material";
import MDBox from "../../../../../../components/MDBox";
import MDButton from "../../../../../../components/MDButton";
import MDTypography from "../../../../../../components/MDTypography";
import axios from "axios";
import { useAuth } from "../../../../../../context/AuthContext";

const NewContractServiceModal = ({ open, onClose, onServiceCreated }) => {
  const { authToken } = useAuth();
  const [formData, setFormData] = useState({
    service_name: "",
    price: "",
    cost: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateService = async () => {
    if (!authToken) {
      console.error("Missing auth token");
      return;
    }
    if (!formData.service_name) {
      console.error("Service Name is required");
      return;
    }
    const payload = {
      ...formData,
      price: formData.price ? parseFloat(formData.price) : null,
      cost: formData.cost ? parseFloat(formData.cost) : null,
      // Do not include contract_id as it is not attached yet.
    };

    console.log("Creating service with payload:", payload);

    try {
      const response = await axios.post(
        "https://app.webitservices.com/api/services",
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log("Service created successfully", response.data);
      onServiceCreated && onServiceCreated(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating service:", error.response?.data || error.message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <MDBox
        sx={{
          width: "600px",
          bgcolor: "background.paper",
          borderRadius: "16px",
          p: 4,
          boxShadow: 24,
        }}
      >
        <MDTypography variant="h4" fontWeight="bold" textAlign="center" color="primary" mb={3}>
          New Contract Service
        </MDTypography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Service Name"
              name="service_name"
              value={formData.service_name}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Cost"
              name="cost"
              type="number"
              value={formData.cost}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <MDBox mt={3} display="flex" justifyContent="flex-end">
          <MDButton variant="contained" color="success" onClick={handleCreateService} sx={{ mr: 2 }}>
            Create Service
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            Cancel
          </MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

export default NewContractServiceModal;
