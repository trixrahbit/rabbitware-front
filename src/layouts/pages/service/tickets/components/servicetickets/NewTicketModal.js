import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
} from "@mui/material";
import { styled } from "@mui/system";

// Styled Box for modern look
const StyledBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  background: theme.palette.background.paper,
  boxShadow: 24,
  borderRadius: 12,
  padding: "24px",
  outline: "none",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
}));

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

  // Dropdown options
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

  // Fetch dropdown data
  useEffect(() => {
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

    if (open) fetchDropdowns();
  }, [open]);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle ticket creation
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
    <Modal open={open} onClose={onClose}>
      <StyledBox>
        <Typography variant="h5" fontWeight="bold" textAlign="center" color="primary">
          🎫 Create a New Ticket
        </Typography>

        <Grid container spacing={2}>
          {/* Left Column */}
          <Grid item xs={6}>
            <TextField
              fullWidth label="Title" variant="outlined" name="title"
              value={formData.title} onChange={handleChange}
            />
            <TextField
              fullWidth label="Client" variant="outlined" name="client_id"
              select value={formData.client_id} onChange={handleChange} sx={{ mt: 2 }}
            >
              {dropdownData.clients.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Priority" variant="outlined" name="priority"
              select value={formData.priority} onChange={handleChange} sx={{ mt: 2 }}
            >
              {dropdownData.priorities.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Impact" variant="outlined" name="impact"
              select value={formData.impact} onChange={handleChange} sx={{ mt: 2 }}
            >
              {dropdownData.impacts.map((i) => (
                <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Right Column */}
          <Grid item xs={6}>
            <TextField
              fullWidth label="Status" variant="outlined" name="status"
              select value={formData.status} onChange={handleChange}
            >
              {dropdownData.statuses.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="SLA Condition" variant="outlined" name="sla_condition_id"
              select value={formData.sla_condition_id} onChange={handleChange} sx={{ mt: 2 }}
            >
              {dropdownData.slaConditions.map((sla) => (
                <MenuItem key={sla.id} value={sla.id}>{sla.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Queue" variant="outlined" name="queue_id"
              select value={formData.queue_id} onChange={handleChange} sx={{ mt: 2 }}
            >
              {dropdownData.queues.map((q) => (
                <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth label="Due Date" variant="outlined" name="due_date" type="date"
              value={formData.due_date} onChange={handleChange} sx={{ mt: 2 }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth label="Description" variant="outlined" multiline rows={3} name="description"
          value={formData.description} onChange={handleChange} sx={{ mt: 2 }}
        />

        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Billing Agreement" variant="outlined" name="billing_agreement_id"
              select value={formData.billing_agreement_id} onChange={handleChange}
            >
              {dropdownData.billingAgreements.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth label="Contact" variant="outlined" name="contact_id"
              select value={formData.contact_id} onChange={handleChange}
            >
              {dropdownData.contacts.map((c) => (
                <MenuItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" mt={3}>
          <Button variant="contained" color="success" onClick={handleCreateTicket} sx={{ flex: 1, mr: 1 }}>
            ✅ Create Ticket
          </Button>
          <Button variant="outlined" color="error" onClick={onClose} sx={{ flex: 1 }}>
            ❌ Cancel
          </Button>
        </Box>
      </StyledBox>
    </Modal>
  );
};

export default NewTicketModal;
