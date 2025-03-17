import React, { useState } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  TextField,
  Grid,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MDButton from "components/MDButton";
import { useAuth } from "context/AuthContext";

// 🎨 Modal Styling
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "50%",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const NewContactModal = ({ open, onClose, clientId, orgId, refreshContacts }) => {
  const { authToken } = useAuth();

  // ✅ Form State
  const [contactData, setContactData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle Contact Creation
  const handleCreateContact = async () => {
    if (!orgId || !clientId) {
      console.error("❌ Missing org ID or client ID");
      setError("Missing organization ID or client ID.");
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      first_name: contactData.first_name,
      last_name: contactData.last_name,
      email: contactData.email,
      phone: contactData.phone,
      role: contactData.role || null, // ✅ Ensure role can be NULL
    };

    try {
      console.log(`📡 Creating contact for orgId: ${orgId}, clientId: ${clientId}`);

      await axios.post(
        `https://app.webitservices.com/api/organizations/${orgId}/clients/${clientId}/contacts`,
        payload,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      console.log("✅ Contact Created Successfully!");

      refreshContacts(); // ✅ Refresh contacts list
      onClose(); // ✅ Close modal after success
    } catch (err) {
      console.error("❌ Error creating contact:", err.response?.data || err.message);

      // ✅ Ensure error is displayed correctly in UI
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          setError(err.response.data.detail.map((e) => `${e.loc.join(" → ")}: ${e.msg}`).join(", "));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError("Failed to create contact. Please try again.");
      }
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="new-contact-modal">
      <Box sx={style}>
        {/* 🔻 Close Button */}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>

        {/* 🔹 Header */}
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
          ➕ Add New Contact
        </Typography>

        {/* 📝 Form */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={contactData.first_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={contactData.last_name}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={contactData.email}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Phone"
              name="phone"
              type="tel"
              value={contactData.phone}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Role"
              name="role"
              value={contactData.role}
              onChange={handleChange}
            />
          </Grid>
        </Grid>

        {/* 🚨 Error Message */}
        {error && (
          <Typography variant="body2" color="error" mt={2} textAlign="center">
            ❌ {error}
          </Typography>
        )}

        {/* ✅ Actions */}
        <Box display="flex" justifyContent="space-between" mt={3}>
          <MDButton
            variant="contained"
            color="success"
            onClick={handleCreateContact}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Contact"}
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            Cancel
          </MDButton>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewContactModal;
