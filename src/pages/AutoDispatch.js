import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AutoDispatch() {
  const navigate = useNavigate();

  const [recentTickets, setRecentTickets] = useState([]);
  const [recentAssigned, setRecentAssigned] = useState([]);
  const [webhookTickets, setWebhookTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [override, setOverride] = useState({});
  const [dispatchMessage, setDispatchMessage] = useState(null);
  const [metrics, setMetrics] = useState({
    recent_total: 0,
    recent_assigned: 0,
    recent_unassigned: 0,
  });

  const fetchData = async () => {
    try {
      const [ticketsRes, assignedRes, webhookRes, metricsRes, resRes] =
        await Promise.all([
          axios.get("/api/auto-dispatch/recent-tickets"),
          axios.get("/api/auto-dispatch/recent-assignments"),
          axios.get("/api/auto-dispatch/webhook-tickets"),
          axios.get("/api/auto-dispatch/metrics"),
          axios.get("/api/auto-dispatch/autotask/resources"),
        ]);
      setRecentTickets(ticketsRes.data);
      setRecentAssigned(assignedRes.data);
      setWebhookTickets(webhookRes.data);
      setMetrics(metricsRes.data);
      setResources(resRes.data);
    } catch (err) {
      console.error("Error loading Auto Dispatch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOverrideChange = (ticketId, value) => {
    setOverride((prev) => ({ ...prev, [ticketId]: value }));
  };

  const saveOverride = async (ticketId) => {
    const resourceId = override[ticketId];
    if (!resourceId) return;
    try {
      await axios.post(
        `/api/auto-dispatch/update-ticket-resource/${ticketId}`,
        {
          resource_id: resourceId,
        },
      );
      fetchData();
    } catch (err) {
      console.error("Error overriding resource", err);
    }
  };

  const dispatchTicket = async (ticketId) => {
    try {
      await axios.post(`/api/auto-dispatch/dispatch-ticket/${ticketId}`);
      setDispatchMessage("Ticket dispatched");
      fetchData();
    } catch (err) {
      console.error("Error dispatching ticket", err);
      setDispatchMessage("Failed to dispatch ticket");
    }
  };

  const handleCloseMsg = () => {
    setDispatchMessage(null);
  };

  return (
    <Box>
      {dispatchMessage && (
        <Snackbar
          open={!!dispatchMessage}
          autoHideDuration={4000}
          onClose={handleCloseMsg}
        >
          <Alert
            onClose={handleCloseMsg}
            severity="info"
            sx={{ width: "100%" }}
          >
            {dispatchMessage}
          </Alert>
        </Snackbar>
      )}
      <Typography variant="h4" gutterBottom>
        Auto Dispatch
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardHeader title="Tickets Last 24h" />
            <CardContent>
              <Typography variant="h3" align="center">
                {metrics.recent_total}
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary">
                {metrics.recent_assigned} assigned / {metrics.recent_unassigned}{" "}
                unassigned
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Tickets" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Due</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTickets.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.ticketNumber}</TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.ticketType}</TableCell>
                        <TableCell>{t.ticketCategory}</TableCell>
                        <TableCell>{t.priority_name}</TableCell>
                        <TableCell>{t.status_name}</TableCell>
                        <TableCell>{t.company_name}</TableCell>
                        <TableCell>
                          {t.dueDateTime
                            ? new Date(t.dueDateTime).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Recent Assignments" />
            <CardContent>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Actions</TableCell>
                      <TableCell>Override</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentAssigned.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.ticketNumber}</TableCell>
                        <TableCell>{t.title}</TableCell>
                        <TableCell>{t.assigned_resource_name}</TableCell>
                        <TableCell>
                          <Select
                            size="small"
                            value={override[t.id] || ""}
                            onChange={(e) =>
                              handleOverrideChange(t.id, e.target.value)
                            }
                          >
                            {resources.map((r) => (
                              <MenuItem key={r.id} value={r.id}>
                                {r.name}
                              </MenuItem>
                            ))}
                          </Select>
                          <Button
                            onClick={() => saveOverride(t.id)}
                            size="small"
                            variant="contained"
                            sx={{ ml: 1 }}
                          >
                            Save
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Webhook Tickets"
              action={
                <Button variant="contained" size="small" onClick={fetchData}>
                  Refresh
                </Button>
              }
            />
            <CardContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                These are the most recent tickets received from the Autotask
                webhook. Use this to monitor incoming tickets in real-time.
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      <TableCell>Title</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell>Assigned To</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {webhookTickets.length > 0 ? (
                      webhookTickets.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>{t.ticketNumber}</TableCell>
                          <TableCell>{t.title}</TableCell>
                          <TableCell>{t.company_name}</TableCell>
                          <TableCell>{t.status}</TableCell>
                          <TableCell>{t.priority}</TableCell>
                          <TableCell>
                            {t.createDate
                              ? new Date(t.createDate).toLocaleString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>{t.assigned_resource_name}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              onClick={() => dispatchTicket(t.id)}
                            >
                              Dispatch
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center">
                          No webhook tickets found. Make sure the Autotask
                          webhook is properly configured.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => navigate("skills")}
          sx={{ mr: 2 }}
        >
          Manage Skills
        </Button>
        <Button variant="contained" onClick={() => navigate("rules")}>
          Manage Rules
        </Button>
      </Box>
    </Box>
  );
}
