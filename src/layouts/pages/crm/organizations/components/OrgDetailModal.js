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
import DeleteIcon from "@mui/icons-material/Delete";
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

// 🎨 Styled Card Component
const StyledCard = ({ title, children }) => (
  <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: "white", p: 2 }}>
    <Typography variant="h6" fontWeight="bold" color="primary" mb={2}>
      {title}
    </Typography>
    {children}
  </Card>
);

// 🎨 Tab Panel Component
function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index} style={{ width: "100%" }}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const OrganizationDetailsModal = ({ open, onClose, organization, refreshOrganizations }) => {
  const { authToken, user } = useAuth();
  const [value, setValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [orgData, setOrgData] = useState(organization);
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [orgTypes, setOrgTypes] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [orgSizes, setOrgSizes] = useState([]);

  // Ensure we have the org id in our local state.
  useEffect(() => {
    console.log("Modal received organization prop:", organization);
    // If organization doesn't have an id but user has organization_id, merge it in.
    if (organization && !organization.id && user?.organization_id) {
      setOrgData({ ...organization, id: user.organization_id });
    } else {
      setOrgData(organization);
    }
  }, [organization, user]);

  // Fetch dropdown data
  useEffect(() => {
    if (!authToken) return;
    const fetchDropdownData = async () => {
      try {
        const [typesRes, industriesRes, sizesRes] = await Promise.all([
          axios.get("https://app.webitservices.com/api/org_types", { headers: { Authorization: `Bearer ${authToken}` } }),
          axios.get("https://app.webitservices.com/api/industries", { headers: { Authorization: `Bearer ${authToken}` } }),
          axios.get("https://app.webitservices.com/api/org_sizes", { headers: { Authorization: `Bearer ${authToken}` } }),
        ]);
        setOrgTypes(typesRes.data);
        setIndustries(industriesRes.data);
        setOrgSizes(sizesRes.data);
      } catch (error) {
        console.error("❌ Error fetching dropdown data:", error);
      }
    };
    fetchDropdownData();
  }, [authToken]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrgData((prev) => ({ ...prev, [name]: value }));
  };

const handleSave = async () => {
  console.log("🔹 Saving organization via POST:", orgData);

  // ✅ Ensure we're using the ID of the organization being edited
  const orgId = orgData?.id || organization?.id;
  if (!orgId) {
    console.error("❌ ERROR: Missing Organization ID");
    return;
  }

  const payload = Object.fromEntries(
    Object.entries(orgData).filter(([key, value]) => value !== null && key !== "id")
  );

  console.log("📡 POST Request Payload:", payload);
  console.log(`📌 POST URL: https://app.webitservices.com/api/organizations/${orgId}`);

  setLoading(true);
  try {
    const response = await axios.post(
      `https://app.webitservices.com/api/organizations/${orgId}`, // ✅ Uses selected organization's ID
      payload,
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Organization saved successfully:", response.data);

    // ✅ Refresh the organizations list
    await refreshOrganizations();

    // ✅ Close modal after successful update
    onClose();
  } catch (error) {
    console.error("❌ ERROR saving organization:", error.response?.data || error.message);
    if (error.response) {
      console.error("📌 Server Response:", error.response.status, error.response.data);
    }
  }
  setLoading(false);
};






  const handleDelete = async () => {
    if (!orgData?.id) return;
    if (!window.confirm("Are you sure you want to delete this organization?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `https://app.webitservices.com/api/organizations/${orgData.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      onClose();
      refreshOrganizations();
    } catch (error) {
      console.error("❌ Error deleting organization:", error);
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
            <MDButton variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleDelete} disabled={loading} sx={{ ml: 1 }}>
              Delete Organization
            </MDButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StyledCard title="Company Profile">
              {editMode ? (
                <Box component="form">
                  <TextField fullWidth label="Name" name="name" value={orgData?.name || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Domain" name="domain" value={orgData?.domain || ""} onChange={handleInputChange} sx={{ mb: 2 }} />
                  <TextField fullWidth label="Phone" name="phone" value={orgData?.phone || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField fullWidth label="Website" name="website" value={orgData?.website || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField fullWidth label="Revenue" name="revenue" value={orgData?.revenue || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField fullWidth label="Founded" name="founded" value={orgData?.founded || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField fullWidth label="Type" name="type" value={orgData?.type || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField fullWidth label="Description" name="description" value={orgData?.description || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />

                  <TextField
                    fullWidth
                    select
                    label="Industry"
                    name="industry"
                    value={orgData?.industry || ""}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      sx: {
                        height: "40px",
                        "& .MuiSelect-select": { paddingTop: "16px", paddingBottom: "16px" },
                      },
                    }}
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry.id} value={industry.name}>
                        {industry.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    select
                    label="Size"
                    name="size"
                    value={orgData?.size || ""}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      sx: {
                        height: "40px",
                        "& .MuiSelect-select": { paddingTop: "16px", paddingBottom: "16px" },
                      },
                    }}
                  >
                    {orgSizes.map((size) => (
                      <MenuItem key={size.id} value={size.name}>
                        {size.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField fullWidth label="Logo" name="logo" value={orgData?.logo || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                  <TextField fullWidth label="Creator ID" name="creator_id" value={orgData?.creator_id || ""} onChange={handleInputChange} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />
                </Box>
              ) : (
                Object.entries(orgData || {}).map(([key, value]) => (
                  <Typography key={key} variant="subtitle1">
                    <strong>{key.replace("_", " ").toUpperCase()}:</strong> {value || "N/A"}
                  </Typography>
                ))
              )}
            </StyledCard>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
              <Tabs value={value} onChange={handleChange} variant="fullWidth">
                <Tab label="Subscriptions" />
                <Tab label="Analytics" />
              </Tabs>
              <CardContent>
                <TabPanel value={value} index={0}>
                  <Typography variant="body1">🔹 List of Subscriptions</Typography>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <Typography variant="body1">🔹 Analytics Overview</Typography>
                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default OrganizationDetailsModal;
