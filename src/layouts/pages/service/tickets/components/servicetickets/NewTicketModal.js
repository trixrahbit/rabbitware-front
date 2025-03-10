import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, MenuItem, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";

const NewTicketModal = ({ open, onClose, onTicketCreated }) => {
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
    slaConditions: [],
    queues: [],
    billingAgreements: [],
    contacts: [],
  });

  useEffect(() => {
    if (!open) return;
    const fetchDropdowns = async () => {
      try {
        const responses = await Promise.all([
          axios.get("https://app.webitservices.com/api/clients"),
          axios.get("https://app.webitservices.com/api/priorities"),
          axios.get("https://app.webitservices.com/api/impacts"),
          axios.get("https://app.webitservices.com/api/statuses"),
          axios.get("https://app.webitservices.com/api/sla_conditions"),
          axios.get("https://app.webitservices.com/api/queues"),
          axios.get("https://app.webitservices.com/api/billing_agreements"),
          axios.get("https://app.webitservices.com/api/contacts"),
        ]);

        setDropdownData({
          clients: responses[0].data,
          priorities: responses[1].data,
          impacts: responses[2].data,
          statuses: responses[3].data,
          slaConditions: responses[4].data,
          queues: responses[5].data,
          billingAgreements: responses[6].data,
          contacts: responses[7].data,
        });
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdowns();
  }, [open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateTicket = () => {
    axios
      .post("https://app.webitservices.com/api/tickets", formData)
      .then((response) => {
        onTicketCreated(response.data);
        onClose();
      })
      .catch((error) => console.error("Error creating ticket:", error));
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
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </MDInput>
            <MDInput
              fullWidth select label="Priority" name="priority"
              value={formData.priority} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.priorities.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </MDInput>
          </Grid>

          <Grid item xs={6}>
            <MDInput
              fullWidth select label="Impact" name="impact"
              value={formData.impact} onChange={handleChange}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.impacts.map((i) => (
                <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
              ))}
            </MDInput>
            <MDInput
              fullWidth select label="Status" name="status"
              value={formData.status} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.statuses.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </MDInput>
            <MDInput
              fullWidth label="Due Date" name="due_date" type="date"
              value={formData.due_date} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            />
          </Grid>
        </Grid>

        <MDInput
          fullWidth label="Description" multiline rows={3} name="description"
          value={formData.description} onChange={handleChange} sx={{ mt: 2 }}
        />

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <MDInput
              fullWidth select label="Billing Agreement" name="billing_agreement_id"
              value={formData.billing_agreement_id} onChange={handleChange}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.billingAgreements.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </MDInput>
          </Grid>
          <Grid item xs={6}>
            <MDInput
              fullWidth select label="Contact" name="contact_id"
              value={formData.contact_id} onChange={handleChange}
              InputLabelProps={{ shrink: true }} // ✅ Fix Label Issue
            >
              {dropdownData.contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</MenuItem>
              ))}
            </MDInput>
          </Grid>
        </Grid>

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
