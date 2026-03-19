import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch
} from '@mui/material';
import axios from 'axios';
import FilterSelector from '../../pages/FilterSelector';

// Alert creation wizard steps
const steps = ['Data Source', 'Filters', 'Action', 'Frequency', 'Review'];

/**
 * Wizard component for creating or editing alerts
 */
function AlertWizard({
  open,
  onClose,
  onSave,
  editingAlert = null
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [integrations, setIntegrations] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [datasets, setDatasets] = useState([]);

  // Teams bot integration state
  const [teamsIntegration, setTeamsIntegration] = useState(null);
  const [teamsIntegrationLoading, setTeamsIntegrationLoading] = useState(false);
  const [teamsIntegrationError, setTeamsIntegrationError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [usePrimaryResource, setUsePrimaryResource] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);


  const [formData, setFormData] = useState({
    name: '',
    description: '',
    integration_id: '',
    dataset_id: '',
    filter_criteria: {},
    frequency: 'daily',
    time: '09:00',
    action_type: 'notification',
    notification_channel: 'teams',
    teams_webhook: '',
    email_recipients: '',
    tag_ids: [],
    business_hours_option: 'both'
  });

  // Load integrations when the dialog opens
  useEffect(() => {
  if (open) {
    fetchIntegrations();
    fetchTags();

    if (editingAlert) {
      setFormData(prevData => ({
        ...prevData,
        ...editingAlert,
        tag_ids: editingAlert.tag_ids || []
      }));
      setSelectedTags(editingAlert.tags || []);

      if (editingAlert.integration_id) {
        setSelectedIntegration(editingAlert.integration_id);
        fetchDatasets(editingAlert.integration_id);
      }

      if (editingAlert.action_type === 'teams_bot') {
        if (editingAlert.action_config?.use_primary_resource) {
          setUsePrimaryResource(true);
        } else if (editingAlert.action_config?.selected_users) {
          setSelectedUsers(editingAlert.action_config.selected_users);
        }

        fetchTeamsIntegration();
        fetchUsers();
      }
    } else {
      setFormData({
        name: '',
        description: '',
        integration_id: '',
        dataset_id: '',
        filter_criteria: {},
        frequency: 'daily',
        time: '09:00',
        action_type: 'notification',
        notification_channel: 'teams',
        teams_webhook: '',
        email_recipients: '',
        tag_ids: [],
        business_hours_option: 'both',
        action_config: {}
      });

      setTeamsIntegration(null);
      setTeamsIntegrationError('');
      setUsers([]);
      setSelectedUsers([]);
      setUsePrimaryResource(false);
      setSelectedIntegration(null);
      setDatasets([]);
      setSelectedTags([]);
    }

    setActiveStep(0);
  }
}, [open, editingAlert]);


  const fetchIntegrations = async () => {
    try {
      setLoading(true);

      // Fetch integrations scoped to the current tenant
      const integrationsResponse = await axios.get('/api/integrations');
      setIntegrations(integrationsResponse.data);

      // Pre-load datasets so they're available when an integration is chosen
      const datasetsResponse = await axios.get('/api/datasets');
      setDatasets(datasetsResponse.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDatasets = async (integrationId = null) => {
    try {
      setLoading(true);
      let url = '/api/datasets';
      if (integrationId) {
        url += `?integration_id=${integrationId}`;
      }
      const response = await axios.get(url);
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'alert' }
      });
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const fetchTeamsIntegration = async () => {
    try {
      setTeamsIntegrationLoading(true);
      setTeamsIntegrationError('');

      // First, check if the user is authenticated
      await axios.get('/api/auth/users/me');

      // Now try to get the Teams integration
      const response = await axios.get('/api/integrations/teams');
      setTeamsIntegration(response.data);

      // Pre-fill the action_config with the integration data
      if (response.data && response.data.settings) {
        const settings = response.data.settings;
        handleActionConfigChange('service_url', settings.service_url || '');
        handleActionConfigChange('conversation_id', settings.conversation_id || '');
        handleActionConfigChange('recipient_id', settings.aad_object_id || '');
      }

      setTeamsIntegrationLoading(false);
    } catch (error) {
      console.error('Error fetching Teams integration:', error);


      // Handle different error status codes
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setTeamsIntegrationError('Authentication error. Please log out and log back in, then try again.');
        } else if (error.response.status === 404) {
          setTeamsIntegrationError('Teams integration not found. Please set up Teams integration first.');
        } else {
          const errorDetail = error.response.data?.detail || 'Unknown error';
          setTeamsIntegrationError(`Error fetching Teams integration: ${errorDetail}`);
        }
      } else {
        setTeamsIntegrationError('Error connecting to the server. Please check your internet connection and try again.');
      }

      setTeamsIntegrationLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);

      // Only check authentication if we haven't already encountered an authentication error
      if (!teamsIntegrationError.includes('Authentication error')) {
        // Check if the user is authenticated
        await axios.get('/api/auth/users/me');
      }

      // For Teams Bot action type, fetch MS365 directory users
      if (formData.action_type === 'teams_bot') {
        try {
          // Try to fetch MS365 directory users first
          const directoryResponse = await axios.get('/api/users/ms365-directory');
          setUsers(directoryResponse.data);
          console.log('Fetched MS365 directory users:', directoryResponse.data);
        } catch (directoryError) {
          console.error('Error fetching MS365 directory users:', directoryError);

          // If fetching directory users fails, fall back to regular users
          if (directoryError.response && directoryError.response.status === 404) {
            // MS365 integration not found, show a specific error
            setError('Microsoft 365 integration not found. Please connect your Microsoft 365 account to see directory users.');
          }

          // Fall back to regular users API
          const response = await axios.get('/api/users');
          setUsers(response.data);
          console.log('Fetched regular users as fallback:', response.data);
        }
      } else {
        // For other action types, get the regular list of users
        const response = await axios.get('/api/users');
        setUsers(response.data);
      }

      setUsersLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);



      // Handle different error status codes
      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication error. Please log out and log back in, then try again.');
        } else if (error.response.status === 422) {
          setError('Server error. Please try again later or contact support.');
        } else if (error.response.status === 404 && error.response.data?.detail?.includes('Microsoft 365 integration not found')) {
          setError('Microsoft 365 integration not found. Please connect your Microsoft 365 account to see directory users.');
        } else {
          setError('Error fetching users. Please try again.');
        }
      } else {
        setError('Error connecting to the server. Please check your internet connection and try again.');
      }

      setUsersLoading(false);
    }
  };

  const handleActionConfigChange = (field, value) => {
    setFormData({
      ...formData,
      action_config: {
        ...formData.action_config,
        [field]: value
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // side-effects driven by changes to formData
  useEffect(() => {
    if (formData.action_type === 'teams_bot') {
      setError('');
      setTeamsIntegrationError('');
      fetchTeamsIntegration();
      fetchUsers();
    }
  }, [formData.action_type]);

  useEffect(() => {
    if (formData.integration_id) {
      setSelectedIntegration(formData.integration_id);
      fetchDatasets(formData.integration_id);
      setFormData(prev => ({ ...prev, dataset_id: '' }));
    }
 }, [formData.integration_id]);


  const handleTagsChange = (event, newValue) => {
    setSelectedTags(newValue);
    setFormData({
      ...formData,
      tag_ids: newValue.map(tag => tag.id)
    });
  };

  // Functions for handling filter changes
  const handleAddFilter = (field, value) => {
    setFormData({
      ...formData,
      filter_criteria: {
        ...formData.filter_criteria,
        [field]: value
      }
    });
  };

  const handleRemoveFilter = (field) => {
    const updatedFilters = { ...formData.filter_criteria };
    delete updatedFilters[field];
    setFormData({
      ...formData,
      filter_criteria: updatedFilters
    });
  };

  const handleFilterChange = (field, value) => {
    setFormData({
      ...formData,
      filter_criteria: {
        ...formData.filter_criteria,
        [field]: value
      }
    });
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const validateCurrentStep = () => {
    setValidationError('');

    switch (activeStep) {
      case 0: // Data Source
        if (!formData.name) {
          setValidationError('Alert name is required');
          return false;
        }
        if (!formData.integration_id) {
          setValidationError('Integration is required');
          return false;
        }
        if (formData.integration_id && !formData.dataset_id) {
          setValidationError('Dataset is required');
          return false;
        }
        break;
      case 1: // Filters
        if (Object.keys(formData.filter_criteria).length === 0) {
          setValidationError('At least one filter is required');
          return false;
        }
        break;
      case 2: // Action
        if (formData.action_type === 'notification') {
          if (formData.notification_channel === 'teams' && !formData.teams_webhook) {
            setValidationError('Teams webhook URL is required');
            return false;
          }
          if (formData.notification_channel === 'email' && !formData.email_recipients) {
            setValidationError('Email recipients are required');
            return false;
          }
        } else if (formData.action_type === 'teams_bot') {
          // If not using primary resource and no users selected, check if we have Teams integration
          if (!usePrimaryResource && selectedUsers.length === 0 && !teamsIntegration) {
            // Check if we have the required fields for a manual Teams bot configuration
            const { service_url, conversation_id, recipient_id } = formData.action_config || {};
            if (!service_url || !conversation_id || !recipient_id) {
              setValidationError('Please either select users, enable "Use Ticket\'s Primary Resource", or provide the required Teams connection information.');
              return false;
            }
          }
        }
        break;
      case 3: // Frequency
        if (!formData.frequency) {
          setValidationError('Frequency is required');
          return false;
        }
        if (!formData.time) {
          setValidationError('Time is required');
          return false;
        }
        break;
      default:
        break;
    }

    return true;
  };

  const handleSave = async () => {
    if (validateCurrentStep()) {
      try {
        setLoading(true);

        // Create a copy of the form data to modify before sending
        const dataToSave = { ...formData };

        // If using Teams Bot, handle the action_config appropriately
        if (dataToSave.action_type === 'teams_bot') {
          // Check if Primary Resource option is enabled
          if (usePrimaryResource) {
            dataToSave.action_config = {
              ...dataToSave.action_config,
              use_primary_resource: true
            };
          }
          // Include selected users if any are selected and Primary Resource is not enabled
          else if (selectedUsers.length > 0) {
            dataToSave.action_config = {
              ...dataToSave.action_config,
              selected_users: selectedUsers
            };
          }

          // If we have a Teams integration, include the user_id and use_integration flag
          if (teamsIntegration) {
            dataToSave.action_config = {
              ...dataToSave.action_config,
              user_id: teamsIntegration.user_id,
              // Include a flag to indicate that this alert should use the Teams integration
              use_integration: true
            };
          }
        }

        await onSave(dataToSave);
        onClose();
      } catch (error) {
        console.error('Error saving alert:', error);
        setValidationError('Failed to save alert. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Alert Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Integration</InputLabel>
              <Select
                name="integration_id"
                value={formData.integration_id}
                onChange={handleChange}
                label="Integration"
              >
                <MenuItem value="">
                  <em>Select an integration</em>
                </MenuItem>
                {integrations.map((integration) => (
                  <MenuItem key={integration.id} value={integration.id}>
                    {integration.integration_type}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                Select an integration to use as data source
              </FormHelperText>
            </FormControl>

            {selectedIntegration && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Dataset</InputLabel>
                <Select
                  name="dataset_id"
                  value={formData.dataset_id}
                  onChange={handleChange}
                  label="Dataset"
                >
                  <MenuItem value="">
                    <em>Select a dataset</em>
                  </MenuItem>
                  {datasets.map((dataset) => (
                    <MenuItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Select the dataset to monitor
                </FormHelperText>
              </FormControl>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configure Filters
            </Typography>

            {formData.integration_id && formData.dataset_id ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body1">
                    Filters for this alert should be configured here when creating the alert.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    You can define specific conditions that will trigger this alert.
                  </Typography>
                </Alert>

                {/* Use the FilterSelector component */}
                {(() => {
                  // Find the integration type and dataset name from the selected IDs
                  const selectedIntegrationType = integrations.find(i => i.id === formData.integration_id)?.integration_type;
                  const selectedDatasetName = datasets.find(d => d.id === formData.dataset_id)?.name;


                  return (
                    <FilterSelector
                      integrationType={selectedIntegrationType}
                      datasetName={selectedDatasetName}
                      currentFilters={formData.filter_criteria}
                      onAddFilter={handleAddFilter}
                      onRemoveFilter={handleRemoveFilter}
                      onFilterChange={handleFilterChange}
                    />
                  );
                })()}
              </>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body1">
                      Please select an integration and dataset first to configure filters.
                    </Typography>
                  </Alert>
                </Grid>
              </Grid>
            )}
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Action Type</InputLabel>
              {console.log('[DEBUG] AlertWizard - Rendering Action Type Select with value:', formData.action_type)}
              <Select
                name="action_type"
                value={formData.action_type}
                onChange={(e) => {
                  console.log('[DEBUG] AlertWizard - Select onChange triggered with value:', e.target.value);
                  handleChange(e);
                }}
                label="Action Type"
              >
                <MenuItem value="notification">Send Notification</MenuItem>
                <MenuItem value="teams_bot">Microsoft Teams Bot</MenuItem>
                <MenuItem value="webhook">Call Webhook</MenuItem>
                <MenuItem value="automation">Run Automation</MenuItem>
              </Select>
            </FormControl>

            {formData.action_type === 'notification' && (
              <>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel>Notification Channel</InputLabel>
                  <Select
                    name="notification_channel"
                    value={formData.notification_channel}
                    onChange={handleChange}
                    label="Notification Channel"
                  >
                    <MenuItem value="teams">Microsoft Teams</MenuItem>
                    <MenuItem value="email">Email</MenuItem>
                    <MenuItem value="slack">Slack</MenuItem>
                  </Select>
                </FormControl>

                {formData.notification_channel === 'teams' && (
                  <TextField
                    fullWidth
                    label="Teams Webhook URL"
                    name="teams_webhook"
                    value={formData.teams_webhook}
                    onChange={handleChange}
                    margin="normal"
                    required
                  />
                )}

                {formData.notification_channel === 'email' && (
                  <TextField
                    fullWidth
                    label="Email Recipients"
                    name="email_recipients"
                    value={formData.email_recipients}
                    onChange={handleChange}
                    margin="normal"
                    placeholder="Enter email addresses separated by commas"
                    required
                  />
                )}
              </>
            )}

            {formData.action_type === 'teams_bot' && (
              <Grid container spacing={2}>
                {/* Always show the users multiselect dropdown when Teams bot is selected */}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={usePrimaryResource}
                        onChange={(e) => setUsePrimaryResource(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Use Ticket's Primary Resource"
                  />
                  <FormHelperText>
                    When enabled, the alert will be sent to the Primary Resource assigned to the ticket.
                  </FormHelperText>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" disabled={usePrimaryResource}>
                    <InputLabel id="users-select-label">Select Users</InputLabel>
                    <Select
                      labelId="users-select-label"
                      multiple
                      value={selectedUsers}
                      onChange={(e) => setSelectedUsers(e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((userId) => {
                            const user = users.find(u => u.id === userId);
                            return (
                              <Chip 
                                key={userId} 
                                label={user ? user.name : userId} 
                              />
                            );
                          })}
                        </Box>
                      )}
                      disabled={usersLoading}
                    >
                      {usersLoading ? (
                        <MenuItem disabled>
                          <CircularProgress size={20} sx={{ mr: 1 }} />
                          Loading users...
                        </MenuItem>
                      ) : users.length === 0 ? (
                        <MenuItem disabled>
                          No users found. Please check your connection.
                        </MenuItem>
                      ) : (
                        users.map((user) => (
                          <MenuItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </MenuItem>
                        ))
                      )}
                    </Select>
                    <FormHelperText>
                      Select users to receive the Teams alert. If none selected, the alert will be sent to the bot owner.
                    </FormHelperText>
                  </FormControl>
                  {error && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {error}
                    </Alert>
                  )}
                </Grid>

                {teamsIntegrationLoading ? (
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                      <CircularProgress />
                    </Box>
                    <Typography align="center">Loading Teams integration...</Typography>
                  </Grid>
                ) : teamsIntegrationError ? (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ my: 2 }}>
                      {teamsIntegrationError}
                    </Alert>
                  </Grid>
                ) : teamsIntegration ? (
                  <>
                    <Grid item xs={12}>
                      <Alert severity="success" sx={{ my: 2 }}>
                        Teams Bot is connected as an integration. Your alerts will be sent to Microsoft Teams automatically.
                      </Alert>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Using Teams integration for user ID: {teamsIntegration.user_id}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="View URL (Optional)"
                        value={(formData.action_config?.view_url) || ''}
                        onChange={(e) => handleActionConfigChange('view_url', e.target.value)}
                        margin="normal"
                        helperText="Optional: URL to view details (will be added as a button in the Teams message)"
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12}>
                      <Alert severity="info" sx={{ my: 2 }}>
                        {teamsIntegrationError ? teamsIntegrationError : 'No Teams integration found. Please provide the Teams connection details manually or set up Teams integration first.'}
                      </Alert>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Service URL"
                        value={(formData.action_config?.service_url) || ''}
                        onChange={(e) => handleActionConfigChange('service_url', e.target.value)}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Conversation ID"
                        value={(formData.action_config?.conversation_id) || ''}
                        onChange={(e) => handleActionConfigChange('conversation_id', e.target.value)}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Recipient ID (AAD Object ID)"
                        value={(formData.action_config?.recipient_id) || ''}
                        onChange={(e) => handleActionConfigChange('recipient_id', e.target.value)}
                        margin="normal"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="View URL (Optional)"
                        value={(formData.action_config?.view_url) || ''}
                        onChange={(e) => handleActionConfigChange('view_url', e.target.value)}
                        margin="normal"
                        helperText="Optional: URL to view details (will be added as a button in the Teams message)"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {formData.action_type === 'webhook' && (
              <TextField
                fullWidth
                label="Webhook URL"
                name="webhook_url"
                value={formData.webhook_url || ''}
                onChange={handleChange}
                margin="normal"
                required
              />
            )}

            {formData.action_type === 'automation' && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel>Automation</InputLabel>
                <Select
                  name="automation_id"
                  value={formData.automation_id || ''}
                  onChange={handleChange}
                  label="Automation"
                >
                  <MenuItem value="1">Create Ticket</MenuItem>
                  <MenuItem value="2">Restart Service</MenuItem>
                  <MenuItem value="3">Scale Resources</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>
        );
      case 3:
        return (
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Frequency</InputLabel>
              <Select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                label="Frequency"
              >
                <MenuItem value="hourly">Hourly</MenuItem>
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal" required>
              <InputLabel>Business Hours Option</InputLabel>
              <Select
                name="business_hours_option"
                value={formData.business_hours_option}
                onChange={handleChange}
                label="Business Hours Option"
              >
                <MenuItem value="both">Run anytime (both during and after business hours)</MenuItem>
                <MenuItem value="business_hours">Run only during business hours (Mon-Fri, 9 AM - 5 PM)</MenuItem>
                <MenuItem value="after_hours">Run only after business hours (nights and weekends)</MenuItem>
              </Select>
              <FormHelperText>
                Determine when this alert should be allowed to run based on business hours
              </FormHelperText>
            </FormControl>

            <TextField
              fullWidth
              label="Time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              margin="normal"
              type="time"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                step: 300, // 5 min
              }}
              required
            />

            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(option) => option.name}
              value={selectedTags}
              onChange={handleTagsChange}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    label={option.name}
                    {...getTagProps({ index })}
                    key={option.id}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Select tags"
                  margin="normal"
                />
              )}
            />
          </Box>
        );
      case 4:
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Alert Configuration
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Alert Name</Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.name}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Integration</Typography>
                <Typography variant="body1" gutterBottom>
                  {integrations.find(i => i.id === formData.integration_id)?.integration_type || 'Unknown'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Dataset</Typography>
                <Typography variant="body1" gutterBottom>
                  {datasets.find(d => d.id === formData.dataset_id)?.name || 'Unknown'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.description || 'No description provided'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Filters</Typography>
                {Object.keys(formData.filter_criteria).length > 0 ? (
                  <Box sx={{ 
                    bgcolor: 'grey.100',
                    p: 1,
                    borderRadius: 1
                  }}>
                    {Object.entries(formData.filter_criteria).map(([key, value]) => (
                      <Box key={key} sx={{ mb: 1 }}>
                        <Typography variant="body2" component="span" sx={{ fontWeight: 'bold' }}>
                          {key}:
                        </Typography>{' '}
                        <Typography variant="body2" component="span">
                          {value !== null ? value.toString() : 'null'}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" gutterBottom>
                    No filters applied
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Frequency</Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.frequency} at {formData.time}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Business Hours</Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.business_hours_option === 'both' 
                    ? 'Run anytime (both during and after business hours)' 
                    : formData.business_hours_option === 'business_hours'
                    ? 'Run only during business hours (Mon-Fri, 9 AM - 5 PM)'
                    : 'Run only after business hours (nights and weekends)'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2">Action</Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.action_type === 'notification' 
                    ? `Send ${formData.notification_channel} notification` 
                    : formData.action_type === 'webhook'
                    ? 'Call webhook'
                    : formData.action_type === 'teams_bot'
                    ? 'Send Microsoft Teams bot message'
                    : 'Run automation'}
                </Typography>

                {formData.action_type === 'teams_bot' && (
                  <Box sx={{ mt: 1, ml: 2 }}>
                    {usePrimaryResource ? (
                      <Typography variant="body2">
                        • Will notify the ticket's primary resource
                      </Typography>
                    ) : selectedUsers.length > 0 ? (
                      <>
                        <Typography variant="body2">
                          • Will notify the following users:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1, ml: 2 }}>
                          {selectedUsers.map((userId) => {
                            const user = users.find(u => u.id === userId);
                            return (
                              <Chip 
                                key={userId} 
                                label={user ? user.name : userId} 
                                size="small"
                              />
                            );
                          })}
                        </Box>
                      </>
                    ) : teamsIntegration ? (
                      <Typography variant="body2">
                        • Using Teams integration for user ID: {teamsIntegration.user_id}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        • Using manual Teams connection settings
                      </Typography>
                    )}

                    {formData.action_config?.view_url && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        • View URL: {formData.action_config?.view_url}
                      </Typography>
                    )}
                  </Box>
                )}
              </Grid>

              {selectedTags.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Tags</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedTags.map(tag => (
                      <Chip key={tag.id} label={tag.name} size="small" />
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="alert-wizard-title"
    >
      <DialogTitle id="alert-wizard-title">
        {editingAlert ? 'Edit Alert' : 'Create New Alert'}
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        {validationError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {validationError}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Box sx={{ flex: '1 1 auto' }} />
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button 
            onClick={handleSave}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {editingAlert ? 'Update' : 'Create'}
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleNext}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default AlertWizard;
