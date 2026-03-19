import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  TextField,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function NextTicketSettings() {
  const [value, setValue] = useState(() => {
    try {
      // Get the saved tab index from localStorage or default to 0
      const savedTab = localStorage.getItem('nextTicketSettingsTab');
      return savedTab !== null ? parseInt(savedTab, 10) : 0;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 0;
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState({
    priority_weight: {
      critical_priority_weight: 100,
      high_priority_weight: 75,
      medium_priority_weight: 50,
      low_priority_weight: 25
    },
    status_weight: {
      new_status_weight: 50,
      escalated_status_weight: 70,
      // Additional status weights will be loaded from the backend
    },
    age_weight: {
      days_old_weight: 5
    }
  });

  // State for contacts
  const [primaryContacts, setPrimaryContacts] = useState([]);
  const [vipContacts, setVipContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [vipWeight, setVipWeight] = useState(50);
  const [dialogOpen, setDialogOpen] = useState(false);

  // State for status weights
  const [availableStatuses, setAvailableStatuses] = useState([
    { id: 1, name: 'New' },
    { id: 5, name: 'Completed' },
    { id: 7, name: 'Waiting Client' },
    { id: 11, name: 'Escalated' },
    { id: 21, name: 'Working Issue Now' },
    { id: 24, name: 'Client Responded' },
    { id: 28, name: 'Quote Needed' },
    { id: 29, name: 'Reopened' },
    { id: 32, name: 'Scheduled' },
    { id: 36, name: 'Scheduling Needed' },
    { id: 38, name: 'Waiting on Hold' },
    { id: 41, name: 'Waiting Vendor' },
    { id: 54, name: 'Needs Project' },
    { id: 56, name: 'Received in Full' },
    { id: 64, name: 'Scheduled Next NA' },
    { id: 70, name: 'Assigned' },
    { id: 71, name: 'Schedule Onsite' },
    { id: 74, name: 'Scheduled Onsite' }
  ]);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [statusWeight, setStatusWeight] = useState(50);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    try {
      // Save the selected tab index to localStorage
      localStorage.setItem('nextTicketSettingsTab', newValue.toString());
    } catch (error) {
      console.error('Error saving tab to localStorage:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchPrimaryContacts();
    fetchVipContacts();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/next-ticket-settings');
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching next ticket settings:', error);
      setError('Failed to load next ticket settings. Please try again.');
      setLoading(false);
    }
  };

  // Fetch primary contacts from Autotask
  const fetchPrimaryContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await axios.get('/api/contacts/primary');
      setPrimaryContacts(response.data);
      setLoadingContacts(false);
    } catch (error) {
      console.error('Error fetching primary contacts:', error);
      setError('Failed to load primary contacts. Please try again.');
      setLoadingContacts(false);
    }
  };

  // Fetch VIP contacts from the database
  const fetchVipContacts = async () => {
    try {
      setLoadingContacts(true);
      const response = await axios.get('/api/contacts/vip');
      setVipContacts(response.data);
      setLoadingContacts(false);
    } catch (error) {
      console.error('Error fetching VIP contacts:', error);
      setError('Failed to load VIP contacts. Please try again.');
      setLoadingContacts(false);
    }
  };

  // Add a contact to the VIP list
  const addVipContact = async (contactId, weight) => {
    try {
      setSaving(true);
      const response = await axios.post('/api/contacts/vip', {
        contact_id: contactId,
        vip_weight: weight
      });

      // Add the new VIP contact to the state
      setVipContacts([...vipContacts, response.data]);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (error) {
      console.error('Error adding VIP contact:', error);
      setError('Failed to add VIP contact. Please try again.');
      setSaving(false);
    }
  };

  // Update a VIP contact's weight
  const updateVipContact = async (vipId, weight) => {
    try {
      setSaving(true);
      const response = await axios.put(`/api/contacts/vip/${vipId}`, {
        vip_weight: weight
      });

      // Update the VIP contact in the state
      setVipContacts(vipContacts.map(contact => 
        contact.id === vipId ? response.data : contact
      ));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (error) {
      console.error('Error updating VIP contact:', error);
      setError('Failed to update VIP contact. Please try again.');
      setSaving(false);
    }
  };

  // Remove a contact from the VIP list
  const removeVipContact = async (vipId) => {
    try {
      setSaving(true);
      await axios.delete(`/api/contacts/vip/${vipId}`);

      // Remove the VIP contact from the state
      setVipContacts(vipContacts.filter(contact => contact.id !== vipId));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setSaving(false);
    } catch (error) {
      console.error('Error removing VIP contact:', error);
      setError('Failed to remove VIP contact. Please try again.');
      setSaving(false);
    }
  };

  // Handle opening the dialog to add a new VIP contact
  const handleOpenDialog = () => {
    setSelectedContact(null);
    setVipWeight(50);
    setDialogOpen(true);
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle adding a new VIP contact
  const handleAddVipContact = () => {
    if (selectedContact) {
      addVipContact(selectedContact, vipWeight);
      handleCloseDialog();
    }
  };

  // Handle opening the dialog to add a new status weight
  const handleOpenStatusDialog = () => {
    setSelectedStatus(null);
    setStatusWeight(50);
    setStatusDialogOpen(true);
  };

  // Handle closing the status dialog
  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  // Handle adding a new status weight
  const handleAddStatusWeight = () => {
    if (selectedStatus) {
      const statusName = availableStatuses.find(status => status.id === selectedStatus)?.name;
      if (statusName) {
        const settingName = `${statusName.toLowerCase().replace(/ /g, '_')}_status_weight`;

        // Update the settings state
        setSettings({
          ...settings,
          status_weight: {
            ...settings.status_weight,
            [settingName]: statusWeight
          }
        });

        handleCloseStatusDialog();
      }
    }
  };

  // Handle removing a status weight
  const handleRemoveStatusWeight = (settingName) => {
    const updatedStatusWeights = { ...settings.status_weight };
    delete updatedStatusWeights[settingName];

    setSettings({
      ...settings,
      status_weight: updatedStatusWeights
    });
  };

  const handleChange = (category, setting, value) => {
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: parseFloat(value)
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');

      // Flatten the settings object for the API
      const flatSettings = {};
      Object.keys(settings).forEach(category => {
        Object.keys(settings[category]).forEach(setting => {
          flatSettings[setting] = settings[category][setting];
        });
      });

      // Update the settings
      await axios.post('/api/next-ticket-settings', flatSettings);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving next ticket settings:', error);
      setError('Failed to save next ticket settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    try {
      setSaving(true);
      setError('');

      // Reset the settings to defaults
      const response = await axios.post('/api/next-ticket-settings/reset');
      setSettings(response.data.reset_settings);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error resetting next ticket settings:', error);
      setError('Failed to reset next ticket settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Next Ticket Settings
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Configure the settings used to calculate the next ticket priority.
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="next ticket settings tabs">
            <Tab label="Priority Weights" />
            <Tab label="Status Weights" />
            <Tab label="Age Weights" />
            <Tab label="VIP Contacts" />
          </Tabs>
        </Box>

        {/* Priority Weights */}
        <TabPanel value={value} index={0}>
          <Typography variant="h6" gutterBottom>
            Priority Weights
            <Tooltip title="These weights determine how much priority affects the ticket score. Positive values add to the score, negative values subtract from it. Higher scores mean tickets will be shown first.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Critical Priority Weight"
                type="number"
                value={settings.priority_weight?.critical_priority_weight || 100}
                onChange={(e) => handleChange('priority_weight', 'critical_priority_weight', e.target.value)}
                margin="normal"
                helperText="Weight for Critical priority tickets (priority = 4). Positive values add to score, negative values subtract."
                InputProps={{ inputProps: { step: 5 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="High Priority Weight"
                type="number"
                value={settings.priority_weight?.high_priority_weight || 75}
                onChange={(e) => handleChange('priority_weight', 'high_priority_weight', e.target.value)}
                margin="normal"
                helperText="Weight for High priority tickets (priority = 1). Positive values add to score, negative values subtract."
                InputProps={{ inputProps: { step: 5 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Medium Priority Weight"
                type="number"
                value={settings.priority_weight?.medium_priority_weight || 50}
                onChange={(e) => handleChange('priority_weight', 'medium_priority_weight', e.target.value)}
                margin="normal"
                helperText="Weight for Medium priority tickets (priority = 2). Positive values add to score, negative values subtract."
                InputProps={{ inputProps: { step: 5 } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Low Priority Weight"
                type="number"
                value={settings.priority_weight?.low_priority_weight || 25}
                onChange={(e) => handleChange('priority_weight', 'low_priority_weight', e.target.value)}
                margin="normal"
                helperText="Weight for Low priority tickets (priority = 3). Positive values add to score, negative values subtract."
                InputProps={{ inputProps: { step: 5 } }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Status Weights */}
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>
            Status Weights
            <Tooltip title="These weights determine how much ticket status affects the ticket score. Positive values add to the score, negative values subtract from it. Higher scores mean tickets will be shown first.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenStatusDialog}
              sx={{ ml: 2 }}
            >
              Add Status Weight
            </Button>
          </Typography>

          {Object.keys(settings.status_weight || {}).length === 0 ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              No status weights have been added yet. Click the "Add Status Weight" button to add weights for different statuses.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(settings.status_weight || {}).map(([key, value]) => {
                    // Convert the setting name to a display name
                    let displayName = key.replace(/_status_weight$/, '').replace(/_/g, ' ');
                    displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

                    // Find the status ID
                    const statusObj = availableStatuses.find(
                      status => status.name.toLowerCase().replace(/ /g, '_') === displayName.toLowerCase().replace(/ /g, '_')
                    );

                    return (
                      <TableRow key={key}>
                        <TableCell>{displayName} {statusObj ? `(status = ${statusObj.id})` : ''}</TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={value}
                            onChange={(e) => handleChange('status_weight', key, e.target.value)}
                            InputProps={{ inputProps: { step: 5 } }}
                            title="Positive values add to score, negative values subtract"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveStatusWeight(key)}
                            disabled={saving}
                            title="Remove Status Weight"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Age Weights */}
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            Age Weights
            <Tooltip title="These weights determine how much ticket age affects the ticket score. Positive values add to the score, negative values subtract from it. With positive values, older tickets get higher scores.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Days Old Weight"
                type="number"
                value={settings.age_weight?.days_old_weight || 5}
                onChange={(e) => handleChange('age_weight', 'days_old_weight', e.target.value)}
                margin="normal"
                helperText="Weight per day since ticket creation. Positive values add to score, negative values subtract."
                InputProps={{ inputProps: { step: 1 } }}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* VIP Contacts */}
        <TabPanel value={value} index={3}>
          <Box>
            <Typography variant="h6" gutterBottom>
              VIP Contacts
              <Tooltip title="Contacts designated as VIPs will have their tickets prioritized based on their individual weights. Positive values add to the score, negative values subtract from it.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                sx={{ ml: 2 }}
                disabled={loadingContacts || primaryContacts.length === 0}
              >
                Add VIP Contact
              </Button>
            </Typography>

            {loadingContacts ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <CircularProgress />
              </Box>
            ) : vipContacts.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No VIP contacts have been added yet. Click the "Add VIP Contact" button to add contacts to the VIP list.
              </Alert>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Contact Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell>VIP Weight</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {vipContacts.map((vipContact) => (
                      <TableRow key={vipContact.id}>
                        <TableCell>{vipContact.contact_name}</TableCell>
                        <TableCell>{vipContact.email}</TableCell>
                        <TableCell>{vipContact.company_name}</TableCell>
                        <TableCell>{vipContact.vip_weight}</TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => removeVipContact(vipContact.id)}
                            disabled={saving}
                            title="Remove VIP Contact"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TabPanel>

        <Divider />
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
            disabled={saving}
          >
            Reset to Defaults
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Settings'}
          </Button>
        </Box>
      </Card>

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Next ticket settings saved successfully!
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Dialog for adding VIP contacts */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add VIP Contact</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="contact-select-label">Select Contact</InputLabel>
            <Select
              labelId="contact-select-label"
              value={selectedContact || ''}
              onChange={(e) => setSelectedContact(e.target.value)}
              label="Select Contact"
            >
              {primaryContacts.map((contact) => (
                <MenuItem 
                  key={contact.id} 
                  value={contact.id}
                  disabled={vipContacts.some(vip => vip.contactID === contact.id)}
                >
                  {contact.firstName} {contact.lastName} ({contact.email}) - {contact.companyName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="VIP Weight"
            type="number"
            value={vipWeight}
            onChange={(e) => setVipWeight(parseFloat(e.target.value))}
            margin="normal"
            helperText="Weight for this VIP contact. Positive values add to score, negative values subtract."
            InputProps={{ inputProps: { step: 5 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAddVipContact} 
            variant="contained" 
            color="primary"
            disabled={!selectedContact}
          >
            Add VIP Contact
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for adding status weights */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Status Weight</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="status-select-label">Select Status</InputLabel>
            <Select
              labelId="status-select-label"
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="Select Status"
            >
              {availableStatuses.map((status) => {
                // Check if this status already has a weight
                const statusKey = `${status.name.toLowerCase().replace(/ /g, '_')}_status_weight`;
                const isDisabled = Object.keys(settings.status_weight || {}).includes(statusKey);

                return (
                  <MenuItem 
                    key={status.id} 
                    value={status.id}
                    disabled={isDisabled}
                  >
                    {status.name} (status = {status.id})
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Status Weight"
            type="number"
            value={statusWeight}
            onChange={(e) => setStatusWeight(parseFloat(e.target.value))}
            margin="normal"
            helperText="Weight for this status. Positive values add to score, negative values subtract."
            InputProps={{ inputProps: { step: 5 } }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancel</Button>
          <Button 
            onClick={handleAddStatusWeight} 
            variant="contained" 
            color="primary"
            disabled={!selectedStatus}
          >
            Add Status Weight
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
