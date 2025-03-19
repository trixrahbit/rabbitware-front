import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, MenuItem, Grid, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useAuth } from "../../../../../context/AuthContext";

const NewContractModal = ({ open, onClose, onContractCreated }) => {
  const { authToken, user } = useAuth();
  const organizationId = user?.organization_id;

  // Form state – contract_number removed.
  const [formData, setFormData] = useState({
    client_id: "",
    pricing: "",
    start_date: "",
    end_date: "",
    details: "",
  });

  // Clients dropdown state.
  const [clients, setClients] = useState([]);

  // Fetch clients for the organization when the modal opens.
  useEffect(() => {
    if (!open || !authToken || !organizationId) return;
    axios
      .get(`https://app.webitservices.com/api/organizations/${organizationId}/clients`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        const clientData = response.data || [];
        setClients(clientData);
      })
      .catch((error) => {
        console.error("Error fetching clients:", error.response?.data || error.message);
      });
  }, [open, authToken, organizationId]);

  // When clients are loaded, ensure that the current formData.client_id is valid.
  useEffect(() => {
    if (clients.length > 0) {
      const valid = clients.find(
        (client) => client.id.toString() === formData.client_id
      );
      if (!valid) {
        setFormData((prev) => ({ ...prev, client_id: "" }));
      }
    }
  }, [clients, formData.client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateContract = async () => {
    if (!authToken) return;
    if (!formData.client_id || !formData.start_date) {
      console.error("Client and Start Date are required.");
      return;
    }
    const payload = {
      client_id: parseInt(formData.client_id, 10),
      pricing: formData.pricing ? parseFloat(formData.pricing) : null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      details: formData.details,
    };

    console.log("Submitting Contract Payload:", payload);
    try {
      await axios.post("https://app.webitservices.com/api/contracts", payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("Contract Created Successfully!");
      if (onContractCreated) onContractCreated();
      onClose();
    } catch (error) {
      console.error("Error creating contract:", error.response?.data || error.message);
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
          borderRadius: "8px",
          p: 3,
          boxShadow: 24,
        }}
      >
        <MDTypography
          variant="h4"
          fontWeight="bold"
          textAlign="center"
          color="primary"
        >
          New Contract
        </MDTypography>
        <Grid container spacing={2} mt={2}>
          {/* Client Dropdown */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Client"
              name="client_id"
              value={formData.client_id || ""}
              onChange={handleChange}
              helperText="Select a client"
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {clients.length === 0 ? (
                <MenuItem value="">Loading...</MenuItem>
              ) : (
                clients.map((client) =>
                  client && client.id ? (
                    <MenuItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </MenuItem>
                  ) : null
                )
              )}
            </TextField>
          </Grid>
          {/* Pricing Field */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Pricing"
              name="pricing"
              type="number"
              value={formData.pricing}
              onChange={handleChange}
              helperText="Enter contract pricing"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {/* Dates */}
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Start Date"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="End Date"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {/* Details */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Details"
              name="details"
              value={formData.details}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <MDBox mt={3} display="flex" justifyContent="flex-end">
          <MDButton
            variant="contained"
            color="success"
            onClick={handleCreateContract}
            sx={{ mr: 2 }}
          >
            Create Contract
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            Cancel
          </MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

export default NewContractModal;
