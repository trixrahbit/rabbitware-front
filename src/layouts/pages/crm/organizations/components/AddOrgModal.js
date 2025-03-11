import React, { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { Modal, MenuItem, Grid } from "@mui/material";

// Material Dashboard 2 PRO components
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";

// Context
import { useAuth } from "../../../../../context/AuthContext";

const AddOrgModal = ({ open, onClose, onSave }) => {
  if (typeof onSave !== "function") {
    console.error("❌ onSave is not a function. Ensure it is properly passed from the parent component.");
    return null; // Prevents component from rendering if `onSave` is invalid
  }

  const { user } = useAuth(); // ✅ Get user from context

  const [orgData, setOrgData] = useState({
    name: "",
    domain: "",
    phone: "",
    type: "",
    industry: "",
    size: "",
  });

  const [dropdownData, setDropdownData] = useState({
    types: [],
    industries: [],
    sizes: [],
  });

  useEffect(() => {
    if (!open) return;
    const fetchDropdowns = async () => {
      try {
        const responses = await Promise.all([
          axios.get("https://app.webitservices.com/api/org_types"),
          axios.get("https://app.webitservices.com/api/industries"),
          axios.get("https://app.webitservices.com/api/org_sizes"),
        ]);

        setDropdownData({
          types: responses[0].data,
          industries: responses[1].data,
          sizes: responses[2].data,
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdowns();
  }, [open]);

  const handleChange = (e) => {
    setOrgData({ ...orgData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!user?.id) {
      console.error("❌ Missing `creator_id`!");
      return;
    }

    const orgPayload = { ...orgData, creator_id: user.id };

    console.log("📢 Submitting organization data:", orgPayload);

    // ✅ Ensure `onSave` is properly called
    if (typeof onSave === "function") {
      onSave(orgPayload);
    } else {
      console.error("❌ onSave is not a valid function.");
    }
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <MDBox
        sx={{
          width: "600px",
          minWidth: "500px",
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
          <Grid item xs={6}>
            <MDInput fullWidth label="Organization Name" name="name" value={orgData.name} onChange={handleChange} />
            <MDInput
              fullWidth select label="Type" name="type"
              value={orgData.type} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.types.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </MDInput>
          </Grid>

          <Grid item xs={6}>
            <MDInput fullWidth label="Domain" name="domain" value={orgData.domain} onChange={handleChange} />
            <MDInput
              fullWidth select label="Industry" name="industry"
              value={orgData.industry} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.industries.map((i) => (
                <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
              ))}
            </MDInput>
          </Grid>
        </Grid>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <MDInput fullWidth label="Phone" name="phone" value={orgData.phone} onChange={handleChange} />
          </Grid>
          <Grid item xs={6}>
            <MDInput
              fullWidth select label="Size" name="size"
              value={orgData.size} onChange={handleChange}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.sizes.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </MDInput>
          </Grid>
        </Grid>

        <MDBox display="flex" justifyContent="space-between" mt={3}>
          <MDButton variant="contained" color="success" onClick={handleSubmit}>
            ✅ Save Organization
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            ❌ Cancel
          </MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

// ✅ Prop Types Validation
AddOrgModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default AddOrgModal;
