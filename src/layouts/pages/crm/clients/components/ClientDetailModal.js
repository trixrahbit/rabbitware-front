import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  MenuItem,
  Box,
  Grid,
  Typography,
  TextField,
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
import ContactsList from "../../contacts/components/ContactsList"; // ✅ Use the new ContactsList component

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

const ClientDetailsModal = ({ open, onClose, client, refreshClients }) => {
  const { authToken, organization } = useAuth();
  const orgId = organization?.id;

  const [value, setValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [clientData, setClientData] = useState(client);
  const [loading, setLoading] = useState(false);

  // Dropdown Data
  const [industries, setIndustries] = useState([]);
  const [sizes, setSizes] = useState([]);

  useEffect(() => {
    setClientData(client);
  }, [client]);

  // ✅ Fetch Industries & Sizes from Backend
  useEffect(() => {
    if (!authToken) return;

    const fetchDropdowns = async () => {
      try {
        const [industriesRes, sizesRes] = await Promise.all([
          axios.get("https://app.webitservices.com/api/industries", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://app.webitservices.com/api/org_sizes", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);
        setIndustries(industriesRes.data || []);
        setSizes(sizesRes.data || []);
      } catch (error) {
        console.error("❌ Error fetching dropdown data:", error);
      }
    };

    fetchDropdowns();
  }, [authToken]);

  // ✅ Handle Tab Changes
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // ✅ Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save Client Profile
  const handleSave = async () => {
    if (!orgId || !clientData?.id) return;
    setLoading(true);
    try {
      await axios.patch(
        `https://app.webitservices.com/api/organizations/${orgId}/clients/${clientData.id}`,
        clientData,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setEditMode(false);
      refreshClients();
    } catch (error) {
      console.error("❌ Error updating client:", error);
    }
    setLoading(false);
  };

  // ✅ Delete Client
  const handleDelete = async () => {
    if (!orgId || !clientData?.id) return;
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    setLoading(true);
    try {
      await axios.delete(
        `https://app.webitservices.com/api/organizations/${orgId}/clients/${clientData.id}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      onClose();
      refreshClients();
    } catch (error) {
      console.error("❌ Error deleting client:", error);
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="client-details-modal">
      <Box sx={style}>
        {/* 🔻 Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* 🔹 Header with Title and Action Buttons */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Client Details
          </Typography>
          <Box>
            {editMode ? (
              <>
                <MDButton
                  variant="contained"
                  color="info"
                  startIcon={<SaveIcon />}
                  onClick={handleSave}
                  disabled={loading}
                >
                  Save
                </MDButton>
                <MDButton
                  variant="contained"
                  color="warning"
                  startIcon={<CancelIcon />}
                  onClick={() => setEditMode(false)}
                  disabled={loading}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </MDButton>
              </>
            ) : (
              <MDButton
                variant="contained"
                color="info"
                startIcon={<EditIcon />}
                onClick={() => setEditMode(true)}
                disabled={loading}
              >
                Edit
              </MDButton>
            )}
            <MDButton
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={loading}
              sx={{ ml: 1 }}
            >
              Delete Client
            </MDButton>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* 🔹 LEFT COLUMN: CLIENT PROFILE */}
          <Grid item xs={12} md={4}>
            <StyledCard title="Company Profile">
              {editMode ? (
                <Box component="form">
                  <TextField
                    fullWidth
                    label="Company Name"
                    name="name"
                    value={clientData?.name}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    name="phone"
                    value={clientData?.phone}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Company Domain"
                    name="domain"
                    value={clientData?.domain}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                  />

                  {/* 🔹 Industry Dropdown */}
                  <TextField
                    fullWidth
                    select
                    label="Industry"
                    name="industry"
                    value={clientData?.industry || ""}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      sx: {
                        height: "40px", // Adjust as needed
                        "& .MuiSelect-select": {
                          paddingTop: "16px",
                          paddingBottom: "16px",
                        },
                      },
                    }}
                  >
                    {industries.map((industry) => (
                      <MenuItem key={industry.id} value={industry.name}>
                        {industry.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* 🔹 Size Dropdown */}
                  <TextField
                    fullWidth
                    select
                    label="Size"
                    name="size"
                    value={clientData?.size || ""}
                    onChange={handleInputChange}
                    sx={{ mb: 2 }}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      sx: {
                        height: "40px", // Adjust as needed
                        "& .MuiSelect-select": {
                          paddingTop: "16px",
                          paddingBottom: "16px",
                        },
                      },
                    }}
                  >
                    {sizes.map((size) => (
                      <MenuItem key={size.id} value={size.name}>
                        {size.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              ) : (
                <Box>
                  <Typography variant="subtitle1">
                    <strong>Company Name:</strong> {client?.name || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Phone:</strong> {client?.phone || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Domain:</strong> {client?.domain || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Industry:</strong> {client?.industry || "N/A"}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>Size:</strong> {client?.size || "N/A"}
                  </Typography>
                </Box>
              )}
            </StyledCard>
          </Grid>

          {/* 🔹 RIGHT COLUMN: TABS */}
          <Grid item xs={12} md={8}>
            <Card sx={{ boxShadow: 3, borderRadius: 2, bgcolor: "white" }}>
              <Tabs value={value} onChange={handleChange} variant="fullWidth">
                <Tab label="Projects" />
                <Tab label="Tickets" />
                <Tab label="Contacts" />
                <Tab label="Contracts" />
                <Tab label="Invoices" />
                <Tab label="Opportunities" />
              </Tabs>
              <CardContent>
                <TabPanel value={value} index={0}>
                  <Typography variant="body1">🔹 List of Projects Here</Typography>
                </TabPanel>
                <TabPanel value={value} index={1}>
                  <Typography variant="body1">🔹 List of Tickets Here</Typography>
                </TabPanel>
                <TabPanel value={value} index={2}>
                  <ContactsList clientId={client?.id} /> {/* ✅ Show contacts list */}
                </TabPanel>
                {/* Add more TabPanels as needed */}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default ClientDetailsModal;