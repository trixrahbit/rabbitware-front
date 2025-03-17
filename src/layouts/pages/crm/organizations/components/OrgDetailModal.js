import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  IconButton,
  Tabs,
  Tab,
  Card,
  CardContent
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
  const [orgData, setOrgData] = useState(organization);
  const [loading, setLoading] = useState(false);

  // ✅ Always use the selected organization without overwriting with the logged-in user's ID
  useEffect(() => {
    if (organization && organization.id) {
      console.log("✅ Selected organization:", organization);
      setOrgData({ ...organization });
    }
  }, [organization]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async () => {
  console.log("🔹 Saving organization:", orgData);

  if (!orgData?.id) {
    console.error("❌ ERROR: Missing selected Organization ID");
    alert("Organization ID is missing! Please select an organization before saving.");
    return;
  }

  // ✅ Ensure the logged-in user's organization ID is available for permission checks
  const superAdminOrgId = user?.organization_id;
  if (!superAdminOrgId) {
    console.error("❌ ERROR: Missing logged-in user's organization ID for authorization");
    alert("Your organization ID is missing! Please log in again.");
    return;
  }

  // ✅ Prepare the payload with only the necessary fields (excluding nulls and IDs)
  const payload = Object.fromEntries(
    Object.entries(orgData).filter(([key, value]) => value !== null && key !== "id")
  );

  console.log("📡 Sending update request for Organization ID:", orgData.id);
  console.log("📌 Sending logged-in user's Organization ID:", superAdminOrgId);

  setLoading(true);
  try {
    await axios.post(
      `https://app.webitservices.com/api/organizations/${orgData.id}`, // ✅ Updates selected organization
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
          "X-Super-Admin-Org-ID": superAdminOrgId, // ✅ Used for permission check
        },
      }
    );

    console.log("✅ Organization updated successfully");

    // ✅ Exit edit mode
    setEditMode(false);

    // ✅ Refresh the organization list after saving
    await refreshOrganizations();

    // ✅ Close the modal after update
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

        <Grid container spacing={3}>
          {/* ✅ LEFT SIDE - COMPANY PROFILE */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: "white", p: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
                Company Profile
              </Typography>
              {editMode ? (
                <Box component="form">
                  <TextField fullWidth label="Name" name="name" value={orgData?.name || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Domain" name="domain" value={orgData?.domain || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Phone" name="phone" value={orgData?.phone || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Website" name="website" value={orgData?.website || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Description" name="description" value={orgData?.description || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                </Box>
              ) : (
                Object.entries(orgData || {}).map(([key, value]) => (
                  <Typography key={key} variant="subtitle1">
                    <strong>{key.replace("_", " ").toUpperCase()}:</strong> {value || "N/A"}
                  </Typography>
                ))
              )}
            </Card>
          </Grid>

          {/* ✅ RIGHT SIDE - TABS & ANALYTICS */}
          <Grid item xs={12} md={8}>
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
      </Box>
    </Modal>
  );
};

export default OrganizationDetailsModal;
