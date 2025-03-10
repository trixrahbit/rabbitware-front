import React, { useState, useEffect } from "react";
import axios from "axios";
import { Modal, Box, TextField, Button, Typography, MenuItem } from "@mui/material";

const NewTicketModal = ({ open, onClose, onTicketCreated }) => {
  // State for form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientId, setClientId] = useState("");
  const [priority, setPriority] = useState("");
  const [impact, setImpact] = useState("");
  const [status, setStatus] = useState("");
  const [slaConditionId, setSlaConditionId] = useState("");
  const [queueId, setQueueId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [billingAgreementId, setBillingAgreementId] = useState("");
  const [contactId, setContactId] = useState("");

  // Dropdown options
  const [clients, setClients] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [slaConditions, setSlaConditions] = useState([]);
  const [queues, setQueues] = useState([]);
  const [billingAgreements, setBillingAgreements] = useState([]);
  const [contacts, setContacts] = useState([]);

  // Fetch dropdown data
  useEffect(() => {
    axios.get("https://app.webitservices.com/api/clients").then(res => setClients(res.data));
    axios.get("https://app.webitservices.com/api/priorities").then(res => setPriorities(res.data));
    axios.get("https://app.webitservices.com/api/impacts").then(res => setImpacts(res.data));
    axios.get("https://app.webitservices.com/api/statuses").then(res => setStatuses(res.data));
    axios.get("https://app.webitservices.com/api/sla_conditions").then(res => setSlaConditions(res.data));
    axios.get("https://app.webitservices.com/api/queues").then(res => setQueues(res.data));
    axios.get("https://app.webitservices.com/api/billing_agreements").then(res => setBillingAgreements(res.data));
    axios.get("https://app.webitservices.com/api/contacts").then(res => setContacts(res.data));
  }, []);

  const handleCreateTicket = () => {
    const newTicket = {
      title,
      description,
      client_id: clientId,
      priority,
      impact,
      status,
      sla_condition_id: slaConditionId,
      queue_id: queueId,
      due_date: dueDate,
      billing_agreement_id: billingAgreementId,
      contact_id: contactId,
    };

    axios
      .post("https://app.webitservices.com/api/tickets", newTicket)
      .then((response) => {
        onTicketCreated(response.data); // Pass new ticket back to parent
        onClose(); // Close modal
      })
      .catch((error) => console.error("Error creating ticket:", error));
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" mb={2}>Create New Ticket</Typography>

        <TextField
          fullWidth label="Title" variant="outlined" value={title}
          onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }}
        />
        <TextField
          fullWidth label="Description" variant="outlined" multiline rows={3}
          value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }}
        />
        <TextField
          fullWidth select label="Client" value={clientId} onChange={(e) => setClientId(e.target.value)}
          sx={{ mb: 2 }}
        >
          {clients.map(client => <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)} sx={{ mb: 2 }}>
          {priorities.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth select label="Impact" value={impact} onChange={(e) => setImpact(e.target.value)} sx={{ mb: 2 }}>
          {impacts.map(i => <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ mb: 2 }}>
          {statuses.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth select label="SLA Condition" value={slaConditionId} onChange={(e) => setSlaConditionId(e.target.value)} sx={{ mb: 2 }}>
          {slaConditions.map(sla => <MenuItem key={sla.id} value={sla.id}>{sla.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth select label="Queue" value={queueId} onChange={(e) => setQueueId(e.target.value)} sx={{ mb: 2 }}>
          {queues.map(q => <MenuItem key={q.id} value={q.id}>{q.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth label="Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} />

        <TextField fullWidth select label="Billing Agreement" value={billingAgreementId} onChange={(e) => setBillingAgreementId(e.target.value)} sx={{ mb: 2 }}>
          {billingAgreements.map(b => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
        </TextField>

        <TextField fullWidth select label="Contact" value={contactId} onChange={(e) => setContactId(e.target.value)} sx={{ mb: 2 }}>
          {contacts.map(c => <MenuItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</MenuItem>)}
        </TextField>

        <Box display="flex" justifyContent="space-between">
          <Button variant="contained" color="primary" onClick={handleCreateTicket}>
            Create Ticket
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NewTicketModal;
