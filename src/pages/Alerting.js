import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel, Chip, TableContainer, Table, TableBody, TableRow, TableCell
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon,
  PlayArrow as RunIcon,
  History as HistoryIcon,
  Chat as ChatIcon,
  Link as LinkIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import FilterSelector from './FilterSelector';
import axios from 'axios';

// Import custom components
import TabPanel from '../components/common/TabPanel';
import AlertTable from '../components/alerting/AlertTable';
import AlertHistoryDialog from '../components/alerting/AlertHistoryDialog';
import AlertWizard from '../components/alerting/AlertWizard';

export default function Alerting() {
  const [value, setValue] = useState(() => {
    try {
      // Get the saved tab index from localStorage or default to 0
      const savedTab = localStorage.getItem('alertingTab');
      return savedTab !== null ? parseInt(savedTab, 10) : 0;
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return 0;
    }
  });
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [validationError, setValidationError] = useState('');
  const [accessError, setAccessError] = useState('');

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [teamsIntegration, setTeamsIntegration] = useState(null);
  const [teamsIntegrationLoading, setTeamsIntegrationLoading] = useState(false);
  const [teamsIntegrationError, setTeamsIntegrationError] = useState('');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
    const [usePrimaryResource, setUsePrimaryResource] = useState(false);

  // Use a ref to track the selected action type

  const [newAlert, setNewAlert] = useState({
    name: '',
    description: '',
    data_source: '',
    filter_criteria: {},
    action_type: '',
    action_config: {},
    frequency: '',
    frequency_config: {},
    is_active: true,
    business_hours_option: 'both',
    tag_ids: []
  });

  // Edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentAlert, setCurrentAlert] = useState(null);

  // History dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Note: We no longer use data sources, as we directly select integrations
  // This array is kept for backward compatibility
  const dataSources = [
    { value: 'Integration', label: 'Integration' }
  ];

  // State for integrations and datasets
  const [integrations, setIntegrations] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  // Available action types
  const actionTypes = [
    { value: 'teams_bot', label: 'Microsoft Teams Bot', icon: <ChatIcon fontSize="small" color="primary" /> },
    { value: 'webhook', label: 'Webhook', icon: <LinkIcon fontSize="small" color="secondary" /> }
  ];

  // Available frequencies
  const frequencies = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  useEffect(() => {
    fetchAlerts();
    fetchIntegrations();
  }, []);

  // Removed useEffect hook that was causing circular dependency issues with action_type

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    try {
      // Save the selected tab index to localStorage
      localStorage.setItem('alertingTab', newValue.toString());
    } catch (error) {
      console.error('Error saving tab to localStorage:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/alerts');
      setAlerts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        } else {
          setError('Failed to load alerts. Please try again.');
        }
      } else {
        setError('Failed to load alerts. Please try again.');
      }
      setLoading(false);
    }
  };

  const fetchIntegrations = async () => {
    try {
      // Fetch all integrations for the current tenant
      const integrationsResponse = await axios.get('/api/integrations');
      setIntegrations(integrationsResponse.data);

      // Also fetch datasets so they are available once an integration is
      // selected
      const datasetsResponse = await axios.get('/api/datasets');
      setDatasets(datasetsResponse.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      setError('Failed to load integrations. Please try again.');
    }
  };

  const fetchDatasets = async (integrationId = null) => {
    try {
      let url = '/api/datasets';
      if (integrationId) {
        url += `?integration_id=${integrationId}`;
      }
      const response = await axios.get(url);
      setDatasets(response.data);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setError('Failed to load datasets. Please try again.');
    }
  };

  const handleOpenWizard = () => {
    setActiveStep(0);
    // Reset the selectedActionTypeRef since we're starting a new alert
    setNewAlert({
      name: '',
      description: '',
      data_source: 'Integration', // Set data_source to 'Integration' by default
      filter_criteria: {},
      action_type: '',
      action_config: {},
      frequency: '',
      frequency_config: {},
      is_active: true,
      integration_id: null,
      dataset_id: null
    });
    setSelectedIntegration(null);
    setDatasets([]);
    setWizardOpen(true);

    // Fetch integrations when opening the wizard
    fetchIntegrations();
  };

  const handleCloseWizard = () => {
    setWizardOpen(false);
  };

  const handleNext = () => {
    // Clear any previous validation errors
    setValidationError('');

    // Validate required fields based on the current step
    if (activeStep === 0) {
      // Step 0: Integration Selection
      if (!newAlert.name) {
        setValidationError('Please enter an alert name.');
        return;
      }
      if (!newAlert.integration_id) {
        setValidationError('Please select an integration.');
        return;
      }
      if (!newAlert.dataset_id) {
        setValidationError('Please select a dataset.');
        return;
      }
    } else if (activeStep === 2) {
      // Step 2: Action
      if (!newAlert.action_type) {
        setValidationError('Please select an action type.');
        return;
      }

      // Validate action_config based on action_type
      if (newAlert.action_type === 'teams_bot') {
        // If Primary Resource option is enabled, that's sufficient for validation
        if (usePrimaryResource) {
          // Primary Resource option is enabled, proceeding with validation
        }
        // If we have selected users, that's sufficient for validation
        else if (selectedUsers.length > 0) {
          // Selected users are present, proceeding with validation
        } 
        // Skip validation if Teams integration is available
        else if (teamsIntegration) {
          // Teams integration is available, no need to validate the connection fields
        } 
        // No Teams integration and no selected users, validate the manual connection fields
        else {
          // Check if we have the required fields for a manual Teams bot configuration
          if (!newAlert.action_config.service_url) {
            setValidationError('Please enter a service URL, select users, or enable the Primary Resource option.');
            return;
          }
          if (!newAlert.action_config.conversation_id) {
            setValidationError('Please enter a conversation ID, select users, or enable the Primary Resource option.');
            return;
          }
          if (!newAlert.action_config.recipient_id) {
            setValidationError('Please enter a recipient ID, select users, or enable the Primary Resource option.');
            return;
          }
        }
      } else if (newAlert.action_type === 'webhook') {
        if (!newAlert.action_config.webhook_url) {
          setValidationError('Please enter a webhook URL.');
          return;
        }
      }
    } else if (activeStep === 3) {
      // Step 3: Frequency
      if (!newAlert.frequency) {
        setValidationError('Please select a frequency.');
        return;
      }

      // Validate frequency_config based on frequency
      if (newAlert.frequency === 'daily') {
        if (newAlert.frequency_config.hour === undefined) {
          setValidationError('Please enter an hour for the daily frequency.');
          return;
        }
        if (newAlert.frequency_config.minute === undefined) {
          setValidationError('Please enter a minute for the daily frequency.');
          return;
        }
      } else if (newAlert.frequency === 'weekly') {
        if (newAlert.frequency_config.day_of_week === undefined) {
          setValidationError('Please select a day of the week for the weekly frequency.');
          return;
        }
        if (newAlert.frequency_config.hour === undefined) {
          setValidationError('Please enter an hour for the weekly frequency.');
          return;
        }
        if (newAlert.frequency_config.minute === undefined) {
          setValidationError('Please enter a minute for the weekly frequency.');
          return;
        }
      } else if (newAlert.frequency === 'monthly') {
        if (newAlert.frequency_config.day_of_month === undefined) {
          setValidationError('Please enter a day of the month for the monthly frequency.');
          return;
        }
        if (newAlert.frequency_config.hour === undefined) {
          setValidationError('Please enter an hour for the monthly frequency.');
          return;
        }
        if (newAlert.frequency_config.minute === undefined) {
          setValidationError('Please enter a minute for the monthly frequency.');
          return;
        }
      }
    }

    // If validation passes, move to the next step
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleCreateAlert = async (alertData) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors

      // Use the data passed from AlertWizard or fall back to newAlert state
      const alertToCreate = alertData || { ...newAlert };

      // Ensure required fields are set
      if (!alertToCreate.data_source) {
        alertToCreate.data_source = 'integration';
      }

      // If using Teams Bot, handle the action_config appropriately
      if (alertToCreate.action_type === 'teams_bot') {
        // Check if Primary Resource option is enabled
        if (usePrimaryResource) {
          alertToCreate.action_config = {
            ...alertToCreate.action_config,
            use_primary_resource: true
          };
        }
        // Include selected users if any are selected and Primary Resource is not enabled
        else if (selectedUsers.length > 0) {
          alertToCreate.action_config = {
            ...alertToCreate.action_config,
            selected_users: selectedUsers
          };
        }

        // If we have a Teams integration, include the user_id and use_integration flag
        if (teamsIntegration) {
          alertToCreate.action_config = {
            ...alertToCreate.action_config,
            user_id: teamsIntegration.user_id,
            // Include a flag to indicate that this alert should use the Teams integration
            use_integration: true
          };
        } else {
          // No Teams integration, but we can still create the alert if we have the required fields
          // Check if we have the required fields for a manual Teams bot configuration
          const { service_url, conversation_id, recipient_id } = alertToCreate.action_config || {};

          if (!service_url || !conversation_id || !recipient_id) {
            // If we're missing required fields and don't have an integration, show an error
            if (!teamsIntegration && (!service_url || !conversation_id || !recipient_id)) {
              setError('Missing required Teams connection information. Please provide Service URL, Conversation ID, and Recipient ID, or set up a Teams integration.');
              setLoading(false);
              return;
            }
          }
        }
      }

      const response = await axios.post('/api/alerts', alertToCreate);
      setAlerts([...alerts, response.data]);
      setSuccessMessage('Alert created successfully');
      setSuccess(true);
      setWizardOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error creating alert:', error);

      if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
          setError('Authentication error. Please log out and log back in, then try again.');
        } else if (error.response.status === 400) {
          // Handle specific 400 errors from the backend
          let errorMessage = 'Validation error. Please check your input and try again.';
          if (error.response.data?.detail) {
            // Check if detail is an object and convert it to a string if necessary
            if (typeof error.response.data.detail === 'object') {
              errorMessage = error.response.data.detail.msg || JSON.stringify(error.response.data.detail);
            } else {
              errorMessage = error.response.data.detail;
            }
          }
          setError(errorMessage);
        } else if (error.response.status === 422) {
          setError('Validation error. Please check your input and try again.');
        } else {
          // Handle other error types
          let errorDetail = 'Unknown error';
          if (error.response.data?.detail) {
            // Check if detail is an object and convert it to a string if necessary
            if (typeof error.response.data.detail === 'object') {
              errorDetail = error.response.data.detail.msg || JSON.stringify(error.response.data.detail);
            } else {
              errorDetail = error.response.data.detail;
            }
          }
          setError(`Failed to create alert: ${errorDetail}`);
        }
      } else {
        setError('Failed to create alert. Please check your connection and try again.');
      }

      setLoading(false);
    }
  };

  const handleEditAlert = (alert) => {
    setCurrentAlert(alert);

    // Fetch integrations when opening the edit dialog
    fetchIntegrations();

    // If the alert has an integration_id, fetch datasets for that integration
    if (alert.integration_id) {
      setSelectedIntegration(alert.integration_id);
      fetchDatasets(alert.integration_id);
    }

    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentAlert(null);
  };

  const handleUpdateAlert = async (alertData) => {
    try {
      setLoading(true);
      // Use the data passed from AlertWizard or fall back to currentAlert state
      const alertToUpdate = alertData || currentAlert;
      const response = await axios.put(`/api/alerts/${alertToUpdate.id}`, alertToUpdate);
      setAlerts(alerts.map(alert => alert.id === currentAlert.id ? response.data : alert));
      setSuccessMessage('Alert updated successfully');
      setSuccess(true);
      setEditDialogOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error updating alert:', error);
      setError('Failed to update alert. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`/api/alerts/${alertId}`);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
      setSuccessMessage('Alert deleted successfully');
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error('Error deleting alert:', error);
      setError('Failed to delete alert. Please try again.');
      setLoading(false);
    }
  };

  const handleRunAlert = async (alertId) => {
    try {
      setLoading(true);
      if (alertId) {
        // Run a specific alert by ID
        await axios.post(`/api/alerts/${alertId}/run`);
        setSuccessMessage(`Alert ${alertId} executed successfully`);
      } else {
        // Process all due alerts
        await axios.post('/api/alerts/process');
        setSuccessMessage('Alerts processed successfully');
      }
      setSuccess(true);
      setLoading(false);
      // Refresh the alerts list to show updated last_run times
      fetchAlerts();
    } catch (error) {
      console.error('Error running alert:', error);
      setError(alertId ? `Failed to run alert ${alertId}. Please try again.` : 'Failed to process alerts. Please try again.');
      setLoading(false);
    }
  };

  const handleViewHistory = async (alertId) => {
    try {
      setHistoryLoading(true);

      // Find the alert by ID
      const alert = alerts.find(a => a.id === alertId);
      setSelectedAlert(alert || null);

      const response = await axios.get('/api/alerts/history', {
        params: { alert_id: alertId }
      });
      setAlertHistory(response.data);
      setHistoryDialogOpen(true);
      setHistoryLoading(false);
    } catch (error) {
      console.error('Error fetching alert history:', error);
      setError('Failed to fetch alert history. Please try again.');
      setHistoryLoading(false);
    }
  };

  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setAlertHistory([]);
    setSelectedAlert(null);
  };

  const fetchTeamsIntegration = async () => {
    console.log('[DEBUG] fetchTeamsIntegration - Starting with action_type:', newAlert.action_type);
    try {
      setTeamsIntegrationLoading(true);
      setTeamsIntegrationError('');

      console.log('[DEBUG] fetchTeamsIntegration - Before auth check, action_type:', newAlert.action_type);
      // First, check if the user is authenticated
      await axios.get('/api/auth/users/me');
      console.log('[DEBUG] fetchTeamsIntegration - Auth check successful');

      console.log('[DEBUG] fetchTeamsIntegration - Before fetching Teams integration, action_type:', newAlert.action_type);
      // Now try to get the Teams integration
      const response = await axios.get('/api/integrations/teams');
      console.log('[DEBUG] fetchTeamsIntegration - Teams integration fetch successful:', response.data);
      setTeamsIntegration(response.data);

      // Pre-fill the action_config with the integration data
      if (response.data && response.data.settings) {
        const settings = response.data.settings;
        console.log('[DEBUG] fetchTeamsIntegration - Using settings:', settings);
        handleActionConfigChange('service_url', settings.service_url || '');
        handleActionConfigChange('conversation_id', settings.conversation_id || '');
        handleActionConfigChange('recipient_id', settings.aad_object_id || '');
      }
      setTeamsIntegrationLoading(false);
      console.log('[DEBUG] fetchTeamsIntegration - Completed successfully, action_type:', newAlert.action_type);
    } catch (error) {
      console.error('[DEBUG] fetchTeamsIntegration - Error:', error);


      // Handle different error status codes
      if (error.response) {
        if (error.response.status === 404) {
          // Extract the specific message if available
          const errorMessage = error.response.data?.message || 'No Teams integration found. Please set up Teams integration first.';
          setTeamsIntegrationError(errorMessage);
        } else if (error.response.status === 401) {
          setTeamsIntegrationError('You are not authorized to access this resource. Please log in again.');
        } else if (error.response.status === 422) {
          // Handle validation errors
          let errorMessage = 'Validation error. Please check your input and try again.';
          if (error.response.data?.detail) {
            // Check if detail is an object and convert it to a string if necessary
            if (typeof error.response.data.detail === 'object') {
              errorMessage = error.response.data.detail.msg || JSON.stringify(error.response.data.detail);
            } else {
              errorMessage = error.response.data.detail;
            }
          }
          setTeamsIntegrationError(errorMessage);
        } else {
          // Handle other error types
          let errorDetail = 'Unknown error';
          if (error.response.data?.detail) {
            // Check if detail is an object and convert it to a string if necessary
            if (typeof error.response.data.detail === 'object') {
              errorDetail = error.response.data.detail.msg || JSON.stringify(error.response.data.detail);
            } else {
              errorDetail = error.response.data.detail;
            }
          } else if (error.response.data?.message) {
            errorDetail = error.response.data.message;
          }
          setTeamsIntegrationError(`Error fetching Teams integration: ${errorDetail}`);
        }
      } else {
        setTeamsIntegrationError('Error connecting to the server. Please check your internet connection and try again.');
      }

      setTeamsIntegrationLoading(false);
    }
  };

  const fetchUsers = async () => {
    console.log('[DEBUG] fetchUsers - Starting with action_type:', newAlert.action_type);
    try {
      setUsersLoading(true);

      // Only check authentication if we haven't already encountered an authentication error
      if (!teamsIntegrationError.includes('Authentication error')) {
        console.log('[DEBUG] fetchUsers - Before auth check, action_type:', newAlert.action_type);
        // Check if the user is authenticated
        await axios.get('/api/auth/users/me');
        console.log('[DEBUG] fetchUsers - Auth check successful');
      } else {
        console.log('[DEBUG] fetchUsers - Skipping auth check due to previous error');
      }

      // For Teams Bot action type, fetch MS365 directory users
      if (newAlert.action_type === 'teams_bot') {
        console.log('[DEBUG] fetchUsers - Ref is teams_bot, fetching MS365 directory users');
        try {
          // Try to fetch MS365 directory users first
          console.log('[DEBUG] fetchUsers - Before MS365 directory API call, action_type:', newAlert.action_type);
          const directoryResponse = await axios.get('/api/users/ms365-directory');
          console.log('[DEBUG] fetchUsers - MS365 directory fetch successful, users count:', directoryResponse.data.length);
          setUsers(directoryResponse.data);
          console.log('[DEBUG] fetchUsers - After setUsers with MS365 directory data, action_type:', newAlert.action_type);
        } catch (directoryError) {
          console.error('[DEBUG] fetchUsers - Error fetching MS365 directory users:', directoryError);

          // If fetching directory users fails, fall back to regular users
          if (directoryError.response && directoryError.response.status === 404) {
            console.log('[DEBUG] fetchUsers - MS365 integration not found (404)');
            // MS365 integration not found, show a specific error
            setError('Microsoft 365 integration not found. Please connect your Microsoft 365 account to see directory users.');
          }

          // Fall back to regular users API
          console.log('[DEBUG] fetchUsers - Falling back to regular users API, action_type:', newAlert.action_type);
          const response = await axios.get('/api/users');
          console.log('[DEBUG] fetchUsers - Regular users fetch successful, users count:', response.data.length);
          setUsers(response.data);
        }
      } else {
        // For other action types, get the regular list of users
        console.log('[DEBUG] fetchUsers - Ref is not teams_bot, fetching regular users');
        const response = await axios.get('/api/users');
        console.log('[DEBUG] fetchUsers - Regular users fetch successful, users count:', response.data.length);
        setUsers(response.data);
      }


      setUsersLoading(false);
      console.log('[DEBUG] fetchUsers - Completed successfully, action_type:', newAlert.action_type);
    } catch (error) {
      console.error('[DEBUG] fetchUsers - Error:', error);


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

  const handleAlertChange = (field, value) => {
    console.log(`[DEBUG] handleAlertChange - Called with field: ${field}, value: ${value}, current action_type: ${newAlert.action_type}`);

    // If the action_type is changed to teams_bot, ensure it's set immediately
    if (field === 'action_type' && value === 'teams_bot') {
      console.log('[DEBUG] handleAlertChange - Teams Bot selected');
      setNewAlert(prevAlert => ({
        ...prevAlert,
        action_type: 'teams_bot'
      }));

      // Clear any previous errors
      setError('');
      setTeamsIntegrationError('');

      console.log('[DEBUG] handleAlertChange - Teams Bot selected, preparing to fetch integration and users');

      // Fetch Teams integration and users independently
      // This ensures that even if one fails, the other can still be fetched
      // Use setTimeout to ensure the state update happens before the API calls
      setTimeout(() => {
        fetchTeamsIntegration().catch(err => {
          console.error('Error in fetchTeamsIntegration:', err);
          // We already handle errors inside the function
        });

        fetchUsers().catch(err => {
          console.error('Error in fetchUsers:', err);
          // We already handle errors inside the function
        });
      }, 0);
    } else {
      console.log('[DEBUG] handleAlertChange - Not teams_bot, handling normally');

      // For other fields, update the alert state normally
      setNewAlert(prevAlert => {
        console.log(`[DEBUG] handleAlertChange - Inside setNewAlert for ${field}, prevAlert.action_type:`, prevAlert.action_type);
        return {
          ...prevAlert,
          [field]: value
        };
      });
      console.log(`[DEBUG] handleAlertChange - After setNewAlert for ${field}, action_type should be:`, field === 'action_type' ? value : newAlert.action_type);

    }
  };

  const handleCurrentAlertChange = (field, value) => {
    setCurrentAlert({
      ...currentAlert,
      [field]: value
    });
  };

  const handleFilterChange = (field, value) => {
    setNewAlert({
      ...newAlert,
      filter_criteria: {
        ...newAlert.filter_criteria,
        [field]: value
      }
    });
  };

  const handleAddFilter = (field, value) => {
    setNewAlert({
      ...newAlert,
      filter_criteria: {
        ...newAlert.filter_criteria,
        [field]: value
      }
    });
  };

  const handleRemoveFilter = (field) => {
    const updatedFilters = { ...newAlert.filter_criteria };
    delete updatedFilters[field];
    setNewAlert({
      ...newAlert,
      filter_criteria: updatedFilters
    });
  };

  const handleCurrentFilterChange = (field, value) => {
    setCurrentAlert({
      ...currentAlert,
      filter_criteria: {
        ...currentAlert.filter_criteria,
        [field]: value
      }
    });
  };

  const handleCurrentAddFilter = (field, value) => {
    setCurrentAlert({
      ...currentAlert,
      filter_criteria: {
        ...currentAlert.filter_criteria,
        [field]: value
      }
    });
  };

  const handleCurrentRemoveFilter = (field) => {
    const updatedFilters = { ...currentAlert.filter_criteria };
    delete updatedFilters[field];
    setCurrentAlert({
      ...currentAlert,
      filter_criteria: updatedFilters
    });
  };

  const handleActionConfigChange = (field, value) => {
    setNewAlert({
      ...newAlert,
      action_config: {
        ...newAlert.action_config,
        [field]: value
      }
    });
  };

  const handleCurrentActionConfigChange = (field, value) => {
    setCurrentAlert({
      ...currentAlert,
      action_config: {
        ...currentAlert.action_config,
        [field]: value
      }
    });
  };

  const handleFrequencyConfigChange = (field, value) => {
    setNewAlert({
      ...newAlert,
      frequency_config: {
        ...newAlert.frequency_config,
        [field]: value
      }
    });
  };

  const handleCurrentFrequencyConfigChange = (field, value) => {
    setCurrentAlert({
      ...currentAlert,
      frequency_config: {
        ...currentAlert.frequency_config,
        [field]: value
      }
    });
  };

  // Render the appropriate step content based on the active step
  const getStepContent = (step) => {
    switch (step) {
      case 0: // Data Source
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Select Integration
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="integration-label">Integration</InputLabel>
              <Select
                labelId="integration-label"
                value={newAlert.integration_id || ''}
                onChange={(e) => {
                  const integrationId = e.target.value;
                  handleAlertChange('integration_id', integrationId);
                  setSelectedIntegration(integrationId);

                  // Fetch datasets for the selected integration
                  if (integrationId) {
                    fetchDatasets(integrationId);
                  } else {
                    setDatasets([]);
                  }

                  // Reset dataset selection
                  handleAlertChange('dataset_id', null);
                }}
                label="Integration"
                error={validationError && !newAlert.integration_id}
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
              <FormHelperText>Select the integration to use as data source</FormHelperText>
            </FormControl>

            {selectedIntegration && (
              <FormControl fullWidth margin="normal" required>
                <InputLabel id="dataset-label">Dataset</InputLabel>
                <Select
                  labelId="dataset-label"
                  value={newAlert.dataset_id || ''}
                  onChange={(e) => handleAlertChange('dataset_id', e.target.value)}
                  label="Dataset"
                  error={validationError && !newAlert.dataset_id}
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
                <FormHelperText>Select the dataset to monitor</FormHelperText>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Alert Name"
              value={newAlert.name}
              onChange={(e) => handleAlertChange('name', e.target.value)}
              margin="normal"
              required
              error={validationError && !newAlert.name}
              helperText="Enter a name for this alert"
              sx={{
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: validationError && !newAlert.name ? 'red' : undefined,
                    boxShadow: validationError && !newAlert.name ? '0 0 5px rgba(255, 0, 0, 0.5)' : undefined
                  }
                }
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newAlert.description}
              onChange={(e) => handleAlertChange('description', e.target.value)}
              margin="normal"
              multiline
              rows={3}
              helperText="Optional: Enter a description for this alert"
            />
          </Box>
        );
      case 1: // Filters
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configure Filters
            </Typography>

            {newAlert.integration_id && newAlert.dataset_id ? (
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
                  const selectedIntegrationType = integrations.find(i => i.id === newAlert.integration_id)?.integration_type;
                  const selectedDatasetName = datasets.find(d => d.id === newAlert.dataset_id)?.name;


                  return (
                    <FilterSelector
                      integrationType={selectedIntegrationType}
                      datasetName={selectedDatasetName}
                      currentFilters={newAlert.filter_criteria}
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
      case 2: // Action
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configure Action
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="action-type-label">Action Type</InputLabel>
              {console.log('[DEBUG] Rendering Action Type Select with value:', newAlert.action_type)}
              <Select
                labelId="action-type-label"
                value={newAlert.action_type}
                onChange={(e) => {
                  console.log('[DEBUG] Select onChange triggered with value:', e.target.value);
                  handleAlertChange('action_type', e.target.value);
                }}
                label="Action Type"
                key="action-type-select"
              >
                {actionTypes.map((action) => (
                  <MenuItem key={action.value} value={action.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ mr: 1 }}>{action.icon}</Box>
                      {action.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select the action to take when the alert is triggered</FormHelperText>
            </FormControl>

            {newAlert.action_type === 'teams_bot' && (
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
                        value={newAlert.action_config.view_url || ''}
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
                        value={newAlert.action_config.service_url || ''}
                        onChange={(e) => handleActionConfigChange('service_url', e.target.value)}
                        margin="normal"
                        required
                        helperText="Enter the Teams service URL"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Conversation ID"
                        value={newAlert.action_config.conversation_id || ''}
                        onChange={(e) => handleActionConfigChange('conversation_id', e.target.value)}
                        margin="normal"
                        required
                        helperText="Enter the Teams conversation ID"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Recipient ID"
                        value={newAlert.action_config.recipient_id || ''}
                        onChange={(e) => handleActionConfigChange('recipient_id', e.target.value)}
                        margin="normal"
                        required
                        helperText="Enter the Teams recipient ID"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="View URL (Optional)"
                        value={newAlert.action_config.view_url || ''}
                        onChange={(e) => handleActionConfigChange('view_url', e.target.value)}
                        margin="normal"
                        helperText="Optional: URL to view details (will be added as a button in the Teams message)"
                      />
                    </Grid>
                  </>
                )}
              </Grid>
            )}

            {newAlert.action_type === 'webhook' && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Webhook URL"
                    value={newAlert.action_config.webhook_url || ''}
                    onChange={(e) => handleActionConfigChange('webhook_url', e.target.value)}
                    margin="normal"
                    required
                    helperText="Enter the webhook URL"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Headers (JSON)"
                    value={newAlert.action_config.headers ? JSON.stringify(newAlert.action_config.headers) : ''}
                    onChange={(e) => {
                      try {
                        const headers = e.target.value ? JSON.parse(e.target.value) : {};
                        handleActionConfigChange('headers', headers);
                      } catch (error) {
                        // Don't update if JSON is invalid
                      }
                    }}
                    margin="normal"
                    helperText="Optional: Enter headers as JSON object (e.g., {'Content-Type': 'application/json'})"
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        );
      case 3: // Frequency
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Configure Frequency
            </Typography>
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="frequency-label">Frequency</InputLabel>
              <Select
                labelId="frequency-label"
                value={newAlert.frequency}
                onChange={(e) => handleAlertChange('frequency', e.target.value)}
                label="Frequency"
              >
                {frequencies.map((freq) => (
                  <MenuItem key={freq.value} value={freq.value}>
                    {freq.label}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Select how often the alert should run</FormHelperText>
            </FormControl>

            {newAlert.frequency === 'daily' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hour (0-23)"
                    type="number"
                    value={newAlert.frequency_config.hour || 0}
                    onChange={(e) => handleFrequencyConfigChange('hour', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                    helperText="Hour of the day to run the alert (0-23)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minute (0-59)"
                    type="number"
                    value={newAlert.frequency_config.minute || 0}
                    onChange={(e) => handleFrequencyConfigChange('minute', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    helperText="Minute of the hour to run the alert (0-59)"
                  />
                </Grid>
              </Grid>
            )}

            {newAlert.frequency === 'weekly' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                    <Select
                      labelId="day-of-week-label"
                      value={newAlert.frequency_config.day_of_week || 0}
                      onChange={(e) => handleFrequencyConfigChange('day_of_week', e.target.value)}
                      label="Day of Week"
                    >
                      <MenuItem value={0}>Monday</MenuItem>
                      <MenuItem value={1}>Tuesday</MenuItem>
                      <MenuItem value={2}>Wednesday</MenuItem>
                      <MenuItem value={3}>Thursday</MenuItem>
                      <MenuItem value={4}>Friday</MenuItem>
                      <MenuItem value={5}>Saturday</MenuItem>
                      <MenuItem value={6}>Sunday</MenuItem>
                    </Select>
                    <FormHelperText>Day of the week to run the alert</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hour (0-23)"
                    type="number"
                    value={newAlert.frequency_config.hour || 0}
                    onChange={(e) => handleFrequencyConfigChange('hour', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                    helperText="Hour of the day to run the alert (0-23)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minute (0-59)"
                    type="number"
                    value={newAlert.frequency_config.minute || 0}
                    onChange={(e) => handleFrequencyConfigChange('minute', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    helperText="Minute of the hour to run the alert (0-59)"
                  />
                </Grid>
              </Grid>
            )}

            {newAlert.frequency === 'monthly' && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Day of Month (1-31)"
                    type="number"
                    value={newAlert.frequency_config.day_of_month || 1}
                    onChange={(e) => handleFrequencyConfigChange('day_of_month', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 1, max: 31 } }}
                    helperText="Day of the month to run the alert (1-31)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Hour (0-23)"
                    type="number"
                    value={newAlert.frequency_config.hour || 0}
                    onChange={(e) => handleFrequencyConfigChange('hour', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 23 } }}
                    helperText="Hour of the day to run the alert (0-23)"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Minute (0-59)"
                    type="number"
                    value={newAlert.frequency_config.minute || 0}
                    onChange={(e) => handleFrequencyConfigChange('minute', parseInt(e.target.value))}
                    margin="normal"
                    InputProps={{ inputProps: { min: 0, max: 59 } }}
                    helperText="Minute of the hour to run the alert (0-59)"
                  />
                </Grid>
              </Grid>
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={newAlert.is_active}
                  onChange={(e) => handleAlertChange('is_active', e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Alert"
              sx={{ mt: 2 }}
            />
          </Box>
        );
      case 4: // Review
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Alert Configuration
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Name
                    </TableCell>
                    <TableCell>{newAlert.name}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Description
                    </TableCell>
                    <TableCell>{newAlert.description || 'N/A'}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Data Source
                    </TableCell>
                    <TableCell>Integration</TableCell>
                  </TableRow>
                  {(
                    <>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', paddingLeft: '2rem' }}>
                          Integration
                        </TableCell>
                        <TableCell>
                          {integrations.find(i => i.id === newAlert.integration_id)?.integration_type || 'Not selected'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', paddingLeft: '2rem' }}>
                          Dataset
                        </TableCell>
                        <TableCell>
                          {datasets.find(d => d.id === newAlert.dataset_id)?.name || 'Not selected'}
                        </TableCell>
                      </TableRow>
                    </>
                  )}
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Filters
                    </TableCell>
                    <TableCell>
                      {Object.keys(newAlert.filter_criteria).length === 0 ? (
                        'No filters (all data)'
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: '20px' }}>
                          {Object.entries(newAlert.filter_criteria).map(([key, value]) => (
                            <li key={key}>
                              {key}: {value.toString()}
                            </li>
                          ))}
                        </ul>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Action
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {newAlert.action_type === 'teams_bot' ? (
                          <>
                            <ChatIcon fontSize="small" color="primary" sx={{ mr: 1 }} />
                            Microsoft Teams Bot
                          </>
                        ) : (
                          <>
                            <LinkIcon fontSize="small" color="secondary" sx={{ mr: 1 }} />
                            Webhook
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Frequency
                    </TableCell>
                    <TableCell>
                      {newAlert.frequency.charAt(0).toUpperCase() + newAlert.frequency.slice(1)}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                      Status
                    </TableCell>
                    <TableCell>
                      {newAlert.is_active ? (
                        <Chip label="Active" color="success" />
                      ) : (
                        <Chip label="Inactive" color="default" />
                      )}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (accessError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: 'grey.100' }}>
        <Typography variant="h6">{accessError}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Alerting
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage alerts based on data sources like tickets and companies.
      </Typography>

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleTabChange} aria-label="alerting tabs">
            <Tab label="Alerts" />
            <Tab label="History" />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {/* Alerts Tab */}
        <TabPanel value={value} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">
              Alerts
              <Tooltip title="Alerts allow you to monitor data sources and trigger actions when certain conditions are met.">
                <IconButton size="small" sx={{ ml: 1 }}>
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Typography>
            <Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenWizard}
              >
                Create Alert
              </Button>
            </Box>
          </Box>

          <AlertTable
            alerts={alerts}
            onEdit={handleEditAlert}
            onDelete={handleDeleteAlert}
            onRunNow={handleRunAlert}
            onViewHistory={handleViewHistory}
          />
        </TabPanel>

        {/* History Tab */}
        <TabPanel value={value} index={1}>
          <Typography variant="h6" gutterBottom>
            Alert History
            <Tooltip title="View the execution history of all alerts.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          {/* Implement alert history table here */}
          <Alert severity="info">
            Select an alert and click the history icon to view its execution history.
          </Alert>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={value} index={2}>
          <Typography variant="h6" gutterBottom>
            Alert Settings
            <Tooltip title="Configure global settings for the alerting system.">
              <IconButton size="small" sx={{ ml: 1 }}>
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Typography>

          <Card sx={{ mt: 2 }}>
            <CardHeader title="Redis Configuration" />
            <CardContent>
              <Typography variant="body2" color="text.secondary" paragraph>
                The alerting system uses Redis for scheduling and managing alerts. Follow these steps to set up Redis in Azure:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body2">
                    Create an Azure Cache for Redis instance in the Azure portal.
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    Configure the following environment variables in your .env file:
                  </Typography>
                  <ul>
                    <li>REDIS_HOST: The hostname of your Redis instance</li>
                    <li>REDIS_PORT: The port of your Redis instance (default: 6379)</li>
                    <li>REDIS_PASSWORD: The access key for your Redis instance</li>
                    <li>REDIS_SSL: Whether to use SSL (true/false)</li>
                  </ul>
                </li>
                <li>
                  <Typography variant="body2">
                    Restart the application for the changes to take effect.
                  </Typography>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabPanel>
      </Card>

      {/* Alert Creation Wizard Dialog */}
      <AlertWizard
        open={wizardOpen}
        onClose={handleCloseWizard}
        onSave={handleCreateAlert}
      />

      {/* Edit Alert Dialog */}
      <AlertWizard
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleUpdateAlert}
        editingAlert={currentAlert}
      />

      {/* Alert History Dialog */}
      <AlertHistoryDialog
        open={historyDialogOpen}
        onClose={handleCloseHistoryDialog}
        alertName={selectedAlert ? selectedAlert.name : ''}
        alertHistory={alertHistory}
        loading={historyLoading}
      />

      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
