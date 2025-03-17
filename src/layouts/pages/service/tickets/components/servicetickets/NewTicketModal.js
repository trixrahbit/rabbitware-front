import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, MenuItem, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import { useAuth } from "../../../../../../context/AuthContext";

const NewTicketModal = ({ open, onClose, onTicketCreated }) => {
  const { authToken, user } = useAuth();

  // ✅ Ensure we get the correct organization ID from the user object
  const organizationId = user?.organization_id;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: "",
    priority: "",
    impact: "",
    status: "",
    sla_condition_id: "",
    queue_id: "",
    due_date: "",
    billing_agreement_id: "",
    contact_id: "",
  });

  const [dropdownData, setDropdownData] = useState({
    clients: [],
    priorities: [],
    impacts: [],
    statuses: [],
  });

  // ✅ Fetch dropdown data when modal opens
  useEffect(() => {
    console.log("🔥 useEffect triggered! open:", open, "organizationId:", organizationId);

    if (!open) {
      console.log("❌ Modal is closed. Exiting...");
      return;
    }

    if (!authToken || !organizationId) {
      console.error("❌ Missing authToken or organizationId!");
      return;
    }

    const fetchDropdowns = async () => {
      try {
        console.log(`🔍 Fetching data for organizationId: ${organizationId}`);

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

        console.log("✅ Clients Fetched:", clientsRes.data);
        console.log("✅ Priorities Fetched:", prioritiesRes.data);
        console.log("✅ Impacts Fetched:", impactsRes.data);
        console.log("✅ Statuses Fetched:", statusesRes.data);

        setDropdownData({
          clients: clientsRes.data || [],
          priorities: prioritiesRes.data || [],
          impacts: impactsRes.data || [],
          statuses: statusesRes.data || [],
        });
      } catch (error) {
        console.error("❌ Error fetching dropdown data:", error.response?.data || error.message);
      }
    };

    fetchDropdowns();
  }, [open, organizationId, authToken]);

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle ticket creation
  const handleCreateTicket = async () => {
    if (!authToken || !organizationId) {
      console.error("❌ Cannot create ticket, missing authToken or organizationId");
      return;
    }

    try {
      await axios.post("https://app.webitservices.com/api/tickets",
        { ...formData, organization_id: organizationId }, // ✅ Ensure organization_id is included
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

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
            <MDInput fullWidth label="Title" name="title" value={formData.title} onChange={handleChange} />

            <MDInput
              fullWidth select label="Client" name="client_id"
              value={formData.client_id} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            >
              {dropdownData.clients.length > 0 ? (
                dropdownData.clients.map((client) => (
                  <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Clients Available</MenuItem>
              )}
            </MDInput>

            <MDInput
              fullWidth select label="Priority" name="priority"
              value={formData.priority} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            >
              {dropdownData.priorities.length > 0 ? (
                dropdownData.priorities.map((priority) => (
                  <MenuItem key={priority.id} value={priority.id}>{priority.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Priorities Available</MenuItem>
              )}
            </MDInput>
          </Grid>

          <Grid item xs={6}>
            <MDInput
              fullWidth select label="Impact" name="impact"
              value={formData.impact} onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            >
              {dropdownData.impacts.length > 0 ? (
                dropdownData.impacts.map((impact) => (
                  <MenuItem key={impact.id} value={impact.id}>{impact.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Impacts Available</MenuItem>
              )}
            </MDInput>

            <MDInput
              fullWidth select label="Status" name="status"
              value={formData.status} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            >
              {dropdownData.statuses.length > 0 ? (
                dropdownData.statuses.map((status) => (
                  <MenuItem key={status.id} value={status.id}>{status.name}</MenuItem>
                ))
              ) : (
                <MenuItem disabled>No Statuses Available</MenuItem>
              )}
            </MDInput>

            <MDInput
              fullWidth label="Due Date" name="due_date" type="date"
              value={formData.due_date} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <MDInput
          fullWidth label="Description" multiline rows={3} name="description"
          value={formData.description} onChange={handleChange} sx={{ mt: 2 }}
        />

        <MDBox display="flex" justifyContent="space-between" mt={3}>
          <MDButton variant="contained" color="success" onClick={handleCreateTicket}>
            ✅ Create Ticket
          </MDButton>
          <MDButton variant="outlined" color="error" onClick={onClose}>
            ❌ Cancel
          </MDButton>
        </MDBox>
      </MDBox>
    </Modal>
  );
};

export default NewTicketModal;
