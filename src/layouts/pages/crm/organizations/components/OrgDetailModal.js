import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Grid,
  Typography,
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import MDButton from "../../../../../components/MDButton";
import { useAuth } from "../../../../../context/AuthContext";

// 🎨 Modal Styling
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "85%",
  bgcolor: "#f4f6f8",
  boxShadow: 24,
  p: 4,
  borderRadius: "12px",
  overflowY: "auto",
  maxHeight: "90%",
};

const OrganizationDetailsModal = ({ open, onClose, organization, refreshOrganizations }) => {
  const { authToken, user } = useAuth();
  const [value, setValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  if (!organization || !organization.id) {
    console.error("❌ ERROR: No valid organization received in modal!", organization);
    return;
  }
  console.log("✅ Modal received organization:", organization);
  setOrgData({ ...organization });
}, [organization, open]);


  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async () => {
  if (!orgData?.id) {
    console.error("❌ ERROR: Selected Organization ID is missing!", orgData);
    alert("Organization ID is missing! Please select an organization before saving.");
    return;
  }

  const headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };

  // ✅ Only send "X-Super-Admin-Org-ID" if user is a super admin
  if (user?.super_admin) {
    headers["X-Super-Admin-Org-ID"] = user.organization_id;
  }

  const payload = {
    id: orgData.id,
    name: orgData.name,
    domain: orgData.domain,
    phone: orgData.phone || null,
    website: orgData.website || null,
  };

  console.log("📡 Sending update request for Organization ID:", orgData.id);
  console.log("📄 Request Payload:", payload);
  console.log("📌 Headers:", headers);

  setLoading(true);
  try {
    await axios.post(
      `https://app.webitservices.com/api/organizations/${orgData.id}`,
      payload,
      { headers }
    );

    console.log("✅ Organization updated successfully");

    await refreshOrganizations();
    setEditMode(false);
    onClose();
  } catch (error) {
    console.error("❌ ERROR saving organization:", error.response?.data || error.message);
  }
  setLoading(false);
};



return (
  <Modal open={open} onClose={onClose} aria-labelledby="organization-details-modal">
    <Box sx={style}>
      <IconButton aria-label="close" onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
        <CloseIcon />
      </IconButton>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight="bold" color="primary">
          Organization Details
        </Typography>
        <Box>
          {editMode ? (
            <>
              <MDButton variant="contained" color="info" startIcon={<SaveIcon />} onClick={handleSave} disabled={loading}>
                Save
              </MDButton>
              <MDButton variant="contained" color="warning" startIcon={<CancelIcon />} onClick={() => setEditMode(false)} disabled={loading} sx={{ ml: 1 }}>
                Cancel
              </MDButton>
            </>
          ) : (
            <MDButton variant="contained" color="info" startIcon={<EditIcon />} onClick={() => setEditMode(true)} disabled={loading}>
              Edit
            </MDButton>
          )}
        </Box>
      </Box>

      {/* 🚀 Add organization details here */}
      {orgData ? (
        <Grid container spacing={3}>
          {/* ✅ LEFT SIDE - COMPANY PROFILE */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: "white", p: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
                Company Profile
              </Typography>
              {editMode ? (
                <Box component="form">
                  <TextField fullWidth label="Name" name="name" value={orgData?.name || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Domain" name="domain" value={orgData?.domain || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Phone" name="phone" value={orgData?.phone || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle1"><strong>Name:</strong> {orgData?.name || "N/A"}</Typography>
                  <Typography variant="subtitle1"><strong>Domain:</strong> {orgData?.domain || "N/A"}</Typography>
                  <Typography variant="subtitle1"><strong>Phone:</strong> {orgData?.phone || "N/A"}</Typography>
                </Box>
              )}
            </Card>
          </Grid>

          {/* ✅ RIGHT SIDE - TABS & ANALYTICS */}
          <Grid item xs={12} md={6}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
              <Tabs value={value} onChange={handleChange} variant="fullWidth">
                <Tab label="Subscriptions" />
                <Tab label="Analytics" />
              </Tabs>
              <CardContent>
                <Typography variant="body1">🔹 Additional Organization Details</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="h6" color="error" align="center">
          ❌ No Organization Selected
        </Typography>
      )}
    </Box>
  </Modal>
);

};

export default OrganizationDetailsModal;
