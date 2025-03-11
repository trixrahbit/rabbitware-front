import React, { useState } from "react";
import { Modal, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import { useAuth } from "../../../../../context/AuthContext"; // ✅ Get user context

const AddOrgModal = ({ open, onClose, onSave }) => {
  const { user } = useAuth(); // ✅ Get user from context
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateOrganization = () => {
    if (!user?.id) {
      console.error("❌ Missing `creator_id`!");
      return;
    }

    const orgPayload = { ...formData, creator_id: user.id };
    console.log("📢 Submitting organization data:", orgPayload);
    onSave(orgPayload);
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <MDBox
        sx={{
          width: "500px",
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          borderRadius: 2,
          p: 3,
        }}
      >
        <MDTypography variant="h4" fontWeight="bold" textAlign="center" color="primary">
          🏢 Add New Organization
        </MDTypography>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <MDInput fullWidth label="Organization Name" name="name" value={formData.name} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <MDInput fullWidth label="Domain" name="domain" value={formData.domain} onChange={handleChange} />
          </Grid>
          <Grid item xs={12}>
            <MDInput fullWidth label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          </Grid>
        </Grid>

        <MDBox display="flex" justifyContent="space-between" mt={3}>
          <MDButton variant="contained" color="success" onClick={handleCreateOrganization}>
            ✅ Add Organization
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            ❌ Cancel
          </MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

export default AddOrgModal;
