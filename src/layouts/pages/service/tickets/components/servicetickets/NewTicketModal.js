import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, MenuItem, Grid, TextField, Card } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import { useAuth } from "../../../../../../context/AuthContext";

const NewTicketModal = ({ open, onClose, onTicketCreated }) => {
  const { authToken, user } = useAuth();
  const organizationId = user?.organization_id;

  // Store all select values as strings.
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: "",
    contract_id: "",
    contact_id: "",
    status: "",
    priority: "",
    impact: "",
    sla_condition_id: "",
    queue_id: "",
    billing_agreement_id: "",
    due_date: "",
  });

  const [dropdownData, setDropdownData] = useState({
    clients: [],
    contracts: [],
    contacts: [],
    priorities: [],
    impacts: [],
    statuses: [],
    queues: [],
    slas: [],
  });

  // Fetch global dropdown data when modal opens.
  useEffect(() => {
    if (!open || !authToken || !organizationId) return;
    const fetchDropdowns = async () => {
      try {
        console.log(`Fetching global dropdown data for organizationId: ${organizationId}`);
        const [
          clientsRes,
          prioritiesRes,
          impactsRes,
          statusesRes,
          queuesRes,
          slasRes,
        ] = await Promise.all([
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
          axios.get("https://app.webitservices.com/api/queues", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          axios.get("https://app.webitservices.com/api/slas", {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);
        setDropdownData((prev) => ({
          ...prev,
          clients: clientsRes.data || [],
          priorities: prioritiesRes.data || [],
          impacts: impactsRes.data || [],
          statuses: statusesRes.data || [],
          queues: queuesRes.data || [],
          slas: slasRes.data || [],
        }));
      } catch (error) {
        console.error("Error fetching global dropdown data:", error.response?.data || error.message);
      }
    };
    fetchDropdowns();
  }, [open, organizationId, authToken]);

  // Fetch contracts when a client is selected.
  useEffect(() => {
    if (!formData.client_id) return;
    const clientIdNum = parseInt(formData.client_id, 10);
    if (isNaN(clientIdNum)) return;
    const fetchContracts = async () => {
      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${organizationId}/clients/${clientIdNum}/contracts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("Fetched contracts:", response.data);
        setDropdownData((prev) => ({ ...prev, contracts: response.data || [] }));
      } catch (error) {
        console.error("Error fetching contracts:", error.response?.data || error.message);
      }
    };
    fetchContracts();
  }, [formData.client_id, organizationId, authToken]);

  // Fetch contacts when a client is selected.
  useEffect(() => {
    if (!formData.client_id) return;
    const clientIdNum = parseInt(formData.client_id, 10);
    if (isNaN(clientIdNum)) return;
    const fetchContacts = async () => {
      try {
        const response = await axios.get(
          `https://app.webitservices.com/api/organizations/${organizationId}/clients/${clientIdNum}/contacts`,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("Fetched contacts:", response.data);
        setDropdownData((prev) => ({ ...prev, contacts: response.data || [] }));
      } catch (error) {
        console.error("Error fetching contacts:", error.response?.data || error.message);
      }
    };
    fetchContacts();
  }, [formData.client_id, organizationId, authToken]);

  // When client changes, reset contract and contact selections.
  useEffect(() => {
    setFormData((prev) => ({ ...prev, contract_id: "", contact_id: "" }));
  }, [formData.client_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // On submission, convert applicable fields to integers.
  const handleCreateTicket = async () => {
    if (!authToken || !organizationId) {
      console.error("Missing authToken or organizationId");
      return;
    }
    if (!formData.title || !formData.description) {
      console.error("Title and Description are required!");
      return;
    }
    const payload = {
      ...formData,
      client_id: formData.client_id ? parseInt(formData.client_id, 10) : null,
      contract_id: formData.contract_id ? parseInt(formData.contract_id, 10) : null,
      contact_id: formData.contact_id ? parseInt(formData.contact_id, 10) : null,
      status_id: formData.status,         // left as string per backend
      priority_id: formData.priority,       // left as string per backend
      impact_id: formData.impact,           // left as string per backend
      billing_agreement_id: formData.billing_agreement_id
        ? parseInt(formData.billing_agreement_id, 10)
        : null,
      sla_condition_id: formData.sla_condition_id
        ? parseInt(formData.sla_condition_id, 10)
        : null,
      queue_id: formData.queue_id ? parseInt(formData.queue_id, 10) : null,
    };

    console.log("Submitting Ticket Payload:", payload);
    try {
      await axios.post("https://app.webitservices.com/api/tickets", payload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log("Ticket Created Successfully!");
      onTicketCreated();
      onClose();
    } catch (error) {
      console.error("Error creating ticket:", error.response?.data || error.message);
    }
  };

  // Helper: get selected client details (for right column)
  const selectedClient = dropdownData.clients.find(
    (client) => client.id.toString() === formData.client_id
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems:"center", justifyContent:"center" }}
    >
      <MDBox
        sx={{
          width: { xs: "90%", sm: "90%", md: "90%" },
          bgcolor: "background.paper",
          borderRadius: "16px",
          p: 4,
          boxShadow: 24,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <MDTypography variant="h4" fontWeight="bold" textAlign="center" color="primary" mb={3}>
          🎫 Create a New Ticket
        </MDTypography>
        <Grid container spacing={3}>
          {/* Left Column: Client-dependent Dropdowns */}
          <Grid item xs={12} md={3}>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Client"
                name="client_id"
                value={formData.client_id || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.clients.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.clients.map((client) =>
                    client && client.id ? (
                      <MenuItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Contract"
                name="contract_id"
                value={formData.contract_id || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.contracts.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.contracts.map((contract) =>
                    contract && contract.id ? (
                      <MenuItem key={contract.id} value={contract.id.toString()}>
                        {contract.contract_number}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Contact"
                name="contact_id"
                value={formData.contact_id || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.contacts.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.contacts.map((contact, index) => {
                    const numericId = contact.id || contact.contact_id || (index + 1000);
                    return (
                      <MenuItem key={numericId} value={numericId.toString()}>
                        {contact.first_name} {contact.last_name}
                      </MenuItem>
                    );
                  })
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Impact"
                name="impact"
                value={formData.impact || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.impacts.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.impacts.map((impact) =>
                    impact && impact.id ? (
                      <MenuItem key={impact.id} value={impact.id.toString()}>
                        {impact.name}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Priority"
                name="priority"
                value={formData.priority || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.priorities.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.priorities.map((priority) =>
                    priority && priority.id ? (
                      <MenuItem key={priority.id} value={priority.id.toString()}>
                        {priority.name}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Status"
                name="status"
                value={formData.status || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.statuses.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.statuses.map((status) =>
                    status && status.id ? (
                      <MenuItem key={status.id} value={status.id.toString()}>
                        {status.name}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="Queue"
                name="queue_id"
                value={formData.queue_id || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.queues.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.queues.map((queue) =>
                    queue && queue.id ? (
                      <MenuItem key={queue.id} value={queue.id.toString()}>
                        {queue.name}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                select
                label="SLA"
                name="sla_condition_id"
                value={formData.sla_condition_id || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                SelectProps={{ sx: { height: "40px" } }}
              >
                {dropdownData.slas.length === 0 ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  dropdownData.slas.map((sla) =>
                    sla && sla.id ? (
                      <MenuItem key={sla.id} value={sla.id.toString()}>
                        {sla.name}
                      </MenuItem>
                    ) : null
                  )
                )}
              </TextField>
            </MDBox>
          </Grid>
          {/* Middle Column: Title & Description */}
          <Grid item xs={12} md={6}>
            <MDBox mb={2}>
              <MDTypography variant="h6" fontWeight="bold" color="info">
                Ticket Details
              </MDTypography>
              {/* Placeholder for Ticket Type & Category */}
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
              />
            </MDBox>
            <MDBox mb={2}>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </MDBox>
          </Grid>
          {/* Right Column: Client Details & Future Info */}
          <Grid item xs={12} md={3}>
            <Card sx={{ p: 2, background: "rgba(0,0,0,0.03)" }}>
              <MDTypography variant="h6" fontWeight="bold" mb={2}>
                Client Details
              </MDTypography>
              {selectedClient ? (
                <MDBox>
                  <MDTypography variant="body1">
                    <strong>Name:</strong> {selectedClient.name}
                  </MDTypography>
                  {selectedClient.email && (
                    <MDTypography variant="body1">
                      <strong>Email:</strong> {selectedClient.email}
                    </MDTypography>
                  )}
                  {selectedClient.phone && (
                    <MDTypography variant="body1">
                      <strong>Phone:</strong> {selectedClient.phone}
                    </MDTypography>
                  )}
                  {/* Additional client details */}
                </MDBox>
              ) : (
                <MDTypography variant="body2" color="textSecondary">
                  No client selected.
                </MDTypography>
              )}
            </Card>
            <MDBox mt={3}>
              <Card sx={{ p: 2, background: "rgba(0,0,0,0.03)" }}>
                <MDTypography variant="h6" fontWeight="bold" mb={2}>
                  Future Info
                </MDTypography>
                <MDTypography variant="body2" color="textSecondary">
                  Reserved for additional details.
                </MDTypography>
              </Card>
            </MDBox>
          </Grid>
        </Grid>
        <MDBox display="flex" justifyContent="flex-end" mt={3}>
          <MDButton variant="contained" color="success" onClick={handleCreateTicket} sx={{ mr: 2 }}>
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
