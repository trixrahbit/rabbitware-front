import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, MenuItem, Grid, TextField } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useAuth } from "../../../../../../context/AuthContext";

const NewTicketModal = ({ open, onClose, onTicketCreated }) => {
  const { authToken, user } = useAuth();
  const organizationId = user?.organization_id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: null,
    contact_id: null,
    priority: null,
    impact: null,
    status: null,
    sla_condition_id: null,
    queue_id: null,
    billing_agreement_id: null,
    due_date: "",
  });

  const [dropdownData, setDropdownData] = useState({
    clients: [],
    contacts: [],
    priorities: [],
    impacts: [],
    statuses: [],
  });

  // ✅ Fetch dropdown data when modal opens
  useEffect(() => {
    if (!open || !authToken || !organizationId) return;

    const fetchDropdowns = async () => {
      try {
        console.log(`🔍 Fetching dropdown data for organizationId: ${organizationId}`);

        const [clientsRes, prioritiesRes, impactsRes, statusesRes] = await Promise.all([
          axios.get(`https://app.webitservices.com/api/organizations/${organizationId}/clients`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://app.webitservices.com/api/priorities", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://app.webitservices.com/api/impacts", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://app.webitservices.com/api/statuses", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        setDropdownData({
          clients: clientsRes.data || [],
          priorities: prioritiesRes.data || [],
          impacts: impactsRes.data || [],
          statuses: statusesRes.data || [],
          contacts: [], // ✅ Reset contacts when opening modal
        });
      } catch (error) {
        console.error("❌ Error fetching dropdown data:", error.response?.data || error.message);
      }
    };

    fetchDropdowns();
  }, [open, organizationId, authToken]);

  // ✅ Fetch contacts when a client is selected
  useEffect(() => {
    if (!formData.client_id) return;

    const fetchContacts = async () => {
      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${organizationId}/clients/${formData.client_id}/contacts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        setDropdownData((prev) => ({ ...prev, contacts: response.data || [] }));
      } catch (error) {
        console.error("❌ Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [formData.client_id, organizationId, authToken]);

  // ✅ Ensure proper data types in form fields
  const handleChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;

    // Convert to integer if field expects a number
    if (["client_id", "contact_id", "priority", "impact", "status", "sla_condition_id", "queue_id", "billing_agreement_id"].includes(name)) {
      processedValue = value ? parseInt(value, 10) : null;
    }

    setFormData({ ...formData, [name]: processedValue });
  };

  // ✅ Handle ticket creation
  const handleCreateTicket = async () => {
    if (!authToken || !organizationId) {
      console.error("❌ Cannot create ticket, missing authToken or organizationId");
      return;
    }

    // ✅ Ensure title and description are strings
    if (!formData.title || !formData.description) {
      console.error("❌ Title and Description are required!");
      return;
    }

    const payload = {
      ...formData,
      organization_id: organizationId,
    };

    console.log("📡 Submitting Ticket Payload:", payload);

    try {
      await axios.post("https://app.webitservices.com/api/tickets", payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("✅ Ticket Created Successfully!");
      onTicketCreated();
      onClose();
    } catch (error) {
      console.error("❌ Error creating ticket:", error.response?.data || error.message);
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
          🎫 Create a New Ticket
        </MDTypography>

        <Grid container spacing={2} mt={2}>
          <Grid item xs={6}>
            <TextField fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} />
            {/* Description Input */}
            <TextField
                fullWidth multiline rows={4} label="Description" name="description" value={formData.description} onChange={handleChange}
                sx={{ mt: 2 }}
            />
            {/* Client Dropdown */}
            <TextField
              fullWidth select label="Client" name="client_id" value={formData.client_id || ""} onChange={handleChange}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {dropdownData.clients.map((client) => (
                <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
              ))}
            </TextField>

            {/* Contact Dropdown */}
            <TextField
              fullWidth select label="Contact" name="contact_id" value={formData.contact_id || ""} onChange={handleChange}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {dropdownData.contacts.map((contact) => (
                <MenuItem key={contact.id} value={contact.id}>{`${contact.first_name} ${contact.last_name}`}</MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6}>
            {/* Status Dropdown */}
            <TextField
              fullWidth select label="Status" name="status" value={formData.status || ""} onChange={handleChange}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
              {dropdownData.statuses.map((status) => (
                <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
              ))}
            </TextField>
            {/* Priority Dropdown */}
            <TextField
              fullWidth select label="Priority" name="priority" value={formData.priority || ""} onChange={handleChange}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
                {dropdownData.priorities.map((priority) => (
                    <MenuItem key={priority.id} value={priority.id}>{priority.name}</MenuItem>
                    ))}
            </TextField>
            {/* Impact Dropdown */}
            <TextField
              fullWidth select label="Impact" name="impact" value={formData.impact || ""} onChange={handleChange}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
              SelectProps={{ sx: { height: "40px" } }}
            >
                {dropdownData.impacts.map((impact) => (
                    <MenuItem key={impact.id} value={impact.id}>{impact.name}</MenuItem>
                    ))}
            </TextField>

            {/* Due Date Input */}
            <TextField
              fullWidth label="Due Date" name="due_date" type="date" value={formData.due_date} onChange={handleChange}
              sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <MDBox display="flex" justifyContent="space-between" mt={3}>
          <MDButton variant="contained" color="success" onClick={handleCreateTicket}>✅ Create Ticket</MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>❌ Cancel</MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

export default NewTicketModal;
