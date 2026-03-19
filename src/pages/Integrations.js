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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Link as LinkIcon,
  Settings as SettingsIcon,
  Cloud as CloudIcon,
  Chat as ChatIcon,
  Send as SendIcon,
  SmartToy as AIIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
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

export default function Integrations() {
    const [loading, setLoading] = useState(true);
    const [integrations, setIntegrations] = useState([]);
    const [currentIntegration, setCurrentIntegration] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [autotaskDialogOpen, setAutotaskDialogOpen] = useState(false);
    const [autotaskSettings, setAutotaskSettings] = useState({
        username: '',
        password: '',
        apiUrl: '',
        integrationCode: ''
    });
    const [teamsDialogOpen, setTeamsDialogOpen] = useState(false);
    const [teamsSettings, setTeamsSettings] = useState({
        service_url: '',
        conversation_id: '',
        aad_object_id: ''
    });
    const [openaiDialogOpen, setOpenaiDialogOpen] = useState(false);
    const [openaiSettings, setOpenaiSettings] = useState({
        api_key: '',
        base_url: '',
        api_version: '2025-01-01-preview',
        model: 'gpt-4'
    });
    const [dattoRmmDialogOpen, setDattoRmmDialogOpen] = useState(false);
    const [dattoRmmSettings, setDattoRmmSettings] = useState({
        apiKey: '',
        apiSecretKey: '',
        apiUrl: '',
        syncInterval: '' // Default to 60 minutes
    });
    const [tabValue, setTabValue] = useState(() => {
        try {
            // Get the saved tab index from localStorage or default to 0
            const savedTab = localStorage.getItem('integrationsTab');
            return savedTab !== null ? parseInt(savedTab, 10) : 0;
        } catch (error) {
            console.error('Error accessing localStorage:', error);
            return 0;
        }
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [warning, setWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchIntegrations();

        // Check if we should open the OpenAI dialog automatically
        try {
            const openOpenAIDialog = localStorage.getItem('openOpenAIDialog');
            if (openOpenAIDialog === 'true') {
                // Clear the flag
                localStorage.removeItem('openOpenAIDialog');
                // Open the dialog
                setOpenaiDialogOpen(true);
                // Switch to the first tab (Available Integrations)
                setTabValue(0);
            }
        } catch (error) {
            console.error('Error checking localStorage flag:', error);
        }
    }, []);

    const fetchIntegrations = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/integrations');
            setIntegrations(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching integrations:', error);
            setError('Failed to load integrations. Please try again.');
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        try {
            // Save the selected tab index to localStorage
            localStorage.setItem('integrationsTab', newValue.toString());
        } catch (error) {
            console.error('Error saving tab to localStorage:', error);
        }
    };

    const handleEditClick = (integration) => {
        setCurrentIntegration(integration);
        setEditDialogOpen(true);
    };

    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setCurrentIntegration(null);
    };

    const handleSettingChange = (key, value) => {
        setCurrentIntegration({
            ...currentIntegration,
            settings: {
                ...currentIntegration.settings,
                [key]: value
            }
        });
    };

    const handleSaveSettings = async () => {
        try {
            // Validate required fields for Autotask PSA
            if (currentIntegration?.integration_type === 'autotask_psa') {
                if (!currentIntegration.settings.username || !currentIntegration.settings.password) {
                    setError('Username and password are required for Autotask PSA');
                    return;
                }
            }

            await axios.put(`/api/integrations/${currentIntegration.id}`, {
                settings: currentIntegration.settings
            });

            // Update the integration in the list
            const updatedIntegrations = integrations.map(integration =>
                integration.id === currentIntegration.id
                    ? {...integration, settings: currentIntegration.settings}
                    : integration
            );

            setIntegrations(updatedIntegrations);

            // Test the connection for Autotask PSA after saving
            if (currentIntegration?.integration_type === 'autotask_psa') {
                try {
                    const testResult = await axios.post('/api/integrations/autotask/test');
                    setSuccessMessage(`Autotask PSA settings updated and connection tested: ${testResult.data.message}`);
                } catch (testError) {
                    console.error('Error testing Autotask PSA connection:', testError);
                    if (testError.response && testError.response.data && testError.response.data.message) {
                        setError(`Settings saved but test failed: ${testError.response.data.message}`);
                    } else {
                        setError('Settings saved but connection test failed. Please check your credentials.');
                    }
                    // Keep the dialog open so the user can correct the settings
                    return;
                }
            } else {
                setSuccessMessage('Integration settings updated successfully');
            }

            setEditDialogOpen(false);
            setSuccess(true);
        } catch (error) {
            console.error('Error updating integration:', error);
            setError('Failed to update integration settings. Please try again.');
        }
    };

    const handleDeleteIntegration = async (integrationId, integrationType) => {
        try {
            if (integrationType === 'ms365') {
                await axios.delete('/api/integrations/ms365');
                fetchIntegrations();
                setSuccessMessage('Microsoft 365 integration deleted successfully');
                setSuccess(true);
            } else if (integrationType === 'autotask_psa') {
                await axios.delete('/api/integrations/autotask');
                fetchIntegrations();
                setSuccessMessage('Autotask PSA integration deleted successfully');
                setSuccess(true);
            } else if (integrationType === 'teamscommand') {
                await axios.delete('/api/integrations/teams');
                fetchIntegrations();
                setSuccessMessage('Microsoft Teams integration deleted successfully');
                setSuccess(true);
            } else if (integrationType === 'openai') {
                await axios.delete('/api/integrations/openai');
                fetchIntegrations();
                setSuccessMessage('OpenAI integration deleted successfully');
                setSuccess(true);
            } else if (integrationType === 'datto_rmm') {
                await axios.delete('/api/integrations/datto');
                fetchIntegrations();
                setSuccessMessage('Datto RMM integration deleted successfully');
                setSuccess(true);
            } else if (integrationType === 'teams') {
                // Handle the old 'teams' integration type
                // Delete it using a direct API call to the database
                await axios.delete(`/api/integrations/${integrationId}`);
                fetchIntegrations();
                setSuccessMessage('Old Teams integration deleted successfully');
                setSuccess(true);
            }
        } catch (error) {
            console.error('Error deleting integration:', error);
            setError('Failed to delete integration. Please try again.');
        }
    };

    const handleConnectMS365 = async () => {
        try {
            // Clear any existing MS365 integration silently
            try {
                await axios.delete('/api/integrations/ms365').catch(() => {
                    console.log('No existing MS365 integration to delete or deletion failed');
                });
            } catch (clearError) {
                console.log('Error clearing existing tokens:', clearError);
            }

            // Open a new popup window
            const authWindow = window.open('about:blank', '_blank', 'width=800,height=600');

            if (!authWindow || authWindow.closed || typeof authWindow.closed === 'undefined') {
                setError('Popup blocked! Please allow popups for this site and try again.');
                return;
            }

            // Optional: Show loading message in the new window
            try {
                authWindow.document.write('<html><body><h3>Loading Microsoft 365 authorization page...</h3></body></html>');
            } catch (e) {
                console.warn('Could not write to auth window due to browser restrictions.');
            }

            // Use a relative callback URL that works in any environment
            // The origin will be automatically added by the browser
            const redirectUri = `${window.location.origin}/auth/callback`;

            // Fetch the authorization URL from backend
            const response = await axios.post('/api/integrations/ms365/auth', {
                redirect_uri: redirectUri
            });

            // Redirect the popup to the Microsoft 365 auth URL
            authWindow.location.href = response.data.auth_url;

            // Poll for window closure and refresh integrations list when closed
            const checkWindowClosed = setInterval(() => {
                if (authWindow.closed) {
                    clearInterval(checkWindowClosed);
                    fetchIntegrations();
                }
            }, 1000);

        } catch (error) {
            console.error('Error connecting to MS365:', error);
            setError('Failed to connect to Microsoft 365. Please try again.');
        }
    };
  const handleConnectAutotask = () => {
    // Open the dialog to collect Autotask PSA credentials
    setAutotaskDialogOpen(true);
  };

  const handleAutotaskSettingsChange = (event) => {
    const { name, value } = event.target;
    setAutotaskSettings({
      ...autotaskSettings,
      [name]: value
    });
  };

  const handleAutotaskDialogClose = () => {
    setAutotaskDialogOpen(false);
    // Reset settings when dialog is closed
    setAutotaskSettings({
      username: '',
      password: '',
      apiUrl: '',
      integrationCode: ''
    });
  };

  const handleConnectTeams = () => {
    // Open the dialog to collect Teams settings
    setTeamsDialogOpen(true);
  };

  const handleTeamsSettingsChange = (event) => {
    const { name, value } = event.target;
    setTeamsSettings({
      ...teamsSettings,
      [name]: value
    });
  };

  const handleTeamsDialogClose = () => {
    setTeamsDialogOpen(false);
    // Reset settings when dialog is closed
    setTeamsSettings({
      service_url: '',
      conversation_id: '',
      aad_object_id: ''
    });
  };

  const handleConnectOpenAI = () => {
    // Open the dialog to collect OpenAI settings
    setOpenaiDialogOpen(true);
  };

  const handleOpenaiSettingsChange = (event) => {
    const { name, value } = event.target;
    setOpenaiSettings({
      ...openaiSettings,
      [name]: value
    });
  };

  const handleOpenaiDialogClose = () => {
    setOpenaiDialogOpen(false);
    // Reset settings when dialog is closed
    setOpenaiSettings({
      api_key: '',
      base_url: '',
      api_version: '2025-01-01-preview',
      model: 'gpt-4'
    });
  };

  const handleOpenaiSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Save the integration with the collected settings
      await axios.post('/api/integrations/openai/setup', openaiSettings);

      // Close the dialog
      setOpenaiDialogOpen(false);

      // Navigate to the chat page
      navigate('/chat-with-ai');

      // Refresh the integrations list
      fetchIntegrations();
      setSuccessMessage('OpenAI integration connected successfully');
      setSuccess(true);
    } catch (error) {
      console.error('Error connecting to OpenAI:', error);
      setError('Failed to connect to OpenAI. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTeamsSubmit = async () => {
    try {
      // Check if we have an MS365 integration first
      let ms365Integration = null;
      try {
        const ms365Response = await axios.get('/api/integrations/ms365');
        if (ms365Response.status === 200) {
          ms365Integration = ms365Response.data;
        }
      } catch (ms365Error) {
        console.log('No MS365 integration found or error fetching it:', ms365Error);
      }

      // Prepare settings object
      const settings = { ...teamsSettings };

      // If we have an MS365 integration, include its token data
      if (ms365Integration && ms365Integration.access_token && ms365Integration.refresh_token) {
        console.log('Including MS365 token data in Teams integration setup');
        // The backend will extract this and use it for token data
        settings.token_data = {
          access_token: ms365Integration.access_token,
          refresh_token: ms365Integration.refresh_token,
          expires_in: 3600 // Default to 1 hour
        };
      }

      // Save the integration with the collected settings
      await axios.post('/api/integrations/teams/setup', settings);

      // Close the dialog
      setTeamsDialogOpen(false);

      // Refresh the integrations list
      fetchIntegrations();
      setSuccessMessage('Teams integration connected successfully');
      setSuccess(true);
    } catch (error) {
      console.error('Error connecting to Teams:', error);
      setError('Failed to connect to Teams. Please try again.');
    }
  };

  const handleSendTeamsTestMessage = async () => {
    try {
      // Try to refresh the token first
      try {
        await axios.post('/api/integrations/teams/refresh');
        console.log('Teams token refreshed successfully');
      } catch (refreshError) {
        console.log('Error refreshing Teams token or no token to refresh:', refreshError);
        // Continue anyway, as the test might still work
      }

      const response = await axios.post('/api/integrations/teams/test');
      setSuccessMessage(response.data.message || 'Test message sent successfully');
      setSuccess(true);
    } catch (error) {
      console.error('Error sending Teams test message:', error);

      // Check for any error message related to missing Teams integration settings
      if (error.response?.data?.message?.includes("Missing required Teams integration settings") ||
          error.response?.data?.message?.includes("Teams integration not found")) {
        setError(
          "Missing required Teams integration settings. You need to interact with the Rabbitai bot in Microsoft Teams first. " +
          "Search for 'Rabbitai' in Teams and send a message to the bot, then try again."
        );

        // Open the Teams dialog to show the setup instructions
        setTeamsDialogOpen(true);
      } else if (error.response?.data?.message?.includes("Token has expired") ||
                error.response?.data?.message?.includes("Authentication error")) {
        // Try to refresh the token and try again
        try {
          await axios.post('/api/integrations/teams/refresh');
          console.log('Teams token refreshed after error, trying again');

          // Try sending the test message again
          const retryResponse = await axios.post('/api/integrations/teams/test');
          setSuccessMessage(retryResponse.data.message || 'Test message sent successfully after token refresh');
          setSuccess(true);
          return;
        } catch (retryError) {
          console.error('Error after token refresh:', retryError);
          setError('Failed to send test message even after refreshing the token. Please try reconnecting your Teams integration.');
        }
      } else if (error.response?.data?.message) {
        setError(`Failed to send test message: ${error.response.data.message}`);
      } else {
        setError('Failed to send test message. Please try again.');
      }
    }
  };

  const handleAutotaskSubmit = async () => {
    try {
      // Validate required fields
      if (!autotaskSettings.username || !autotaskSettings.password) {
        setError('Username and password are required');
        return;
      }

      // Save the integration with the collected settings
      await axios.post('/api/integrations/autotask/setup', autotaskSettings);

      // Test the connection
      try {
        const testResult = await axios.post('/api/integrations/autotask/test');
        setSuccessMessage(`Autotask PSA integration connected successfully: ${testResult.data.message}`);
      } catch (testError) {
        console.error('Error testing Autotask PSA connection:', testError);
        if (testError.response && testError.response.data && testError.response.data.message) {
          setError(`Connection saved but test failed: ${testError.response.data.message}`);
        } else {
          setError('Connection saved but test failed. Please check your credentials.');
        }
        // Keep the dialog open so the user can correct the settings
        return;
      }

      // Close the dialog
      setAutotaskDialogOpen(false);

      // Refresh the integrations list
      fetchIntegrations();
      setSuccess(true);
    } catch (error) {
      console.error('Error connecting to Autotask PSA:', error);
      setError('Failed to connect to Autotask PSA. Please try again.');
    }
  };

  const handleSyncMS365 = async (syncType) => {
    try {
      await axios.post('/api/integrations/ms365/sync', { sync_type: syncType });
      setSuccessMessage(`Microsoft 365 ${syncType} synced successfully`);
      setSuccess(true);
    } catch (error) {
      console.error('Error syncing with MS365:', error);
      setError(`Failed to sync Microsoft 365 ${syncType}. Please try again.`);
    }
  };

  const handleSyncAutotask = async () => {
    try {
      const response = await axios.post('/api/integrations/autotask/sync');
      setSuccessMessage(`Autotask PSA tickets synced successfully: ${response.data.synced_count} tickets`);
      setSuccess(true);
    } catch (error) {
      console.error('Error syncing with Autotask PSA:', error);
      setError('Failed to sync Autotask PSA tickets. Please try again.');
    }
  };

  const handleForceFullSyncAutotask = async () => {
    try {
      const response = await axios.post('/api/integrations/autotask/force-sync');
      setSuccessMessage(`Autotask PSA tickets force synced successfully: ${response.data.synced_count} tickets`);
      setSuccess(true);
    } catch (error) {
      console.error('Error force syncing with Autotask PSA:', error);
      setError('Failed to force sync Autotask PSA tickets. Please try again.');
    }
  };

  const handleSyncActiveAutotask = async () => {
    try {
      // Call both endpoints to ensure we get all open tickets
      // First call the API endpoint that uses the direct Autotask API integration
      const response1 = await axios.post('/api/integrations/autotask/sync-active');
        console.log("MEEP");
      // Then call the new endpoint that uses sync_autotask_tickets with exclude_completed=True
      const response2 = await axios.get('/sync-autotask-open-tickets/');

      setSuccessMessage(`Autotask PSA open tickets sync initiated successfully. This may take some time to complete.`);
      setSuccess(true);
    } catch (error) {
      console.error('Error syncing open tickets with Autotask PSA:', error);
      setError('Failed to sync open Autotask PSA tickets. Please try again.');
    }
  };

  const handleSyncCompaniesAutotask = async () => {
    try {
      const response = await axios.post('/api/integrations/autotask/sync-companies');
      setSuccessMessage(`Autotask PSA companies synced successfully: ${response.data.synced_count} companies`);
      setSuccess(true);
    } catch (error) {
      console.error('Error syncing companies with Autotask PSA:', error);
      setError('Failed to sync Autotask PSA companies. Please try again.');
    }
  };

  const handleSyncContactsAutotask = async () => {
    try {
      const response = await axios.post('/api/integrations/autotask/sync-contacts');
      setSuccessMessage(`Autotask PSA contacts synced successfully: ${response.data.synced_count} contacts`);
      setSuccess(true);
    } catch (error) {
      console.error('Error syncing contacts with Autotask PSA:', error);
      setError('Failed to sync Autotask PSA contacts. Please try again.');
    }
  };

  const handleSyncLastActiveAutotask = async () => {
    try {
      const response = await axios.post('/api/integrations/autotask/sync-last-active');
      setSuccessMessage(`Autotask PSA last active tickets synced successfully: ${response.data.synced_count} tickets`);
      setSuccess(true);
    } catch (error) {
      console.error('Error syncing last active tickets with Autotask PSA:', error);
      setError('Failed to sync Autotask PSA last active tickets. Please try again.');
    }
  };

  const handleCreateAutotaskWebhook = async () => {
    try {
      // Get the server URL from window.location or use a default
      const serverUrl = window.location.origin || "https://rabbit.webitservices.com";

      // Create the webhook endpoint URL
      const webhookUrl = `${serverUrl}/api/webhooks/autotask/ticket`;

      console.log(`Creating Autotask webhook with URL: ${webhookUrl}`);

      // Call the API to create the webhook
      const response = await axios.post('/api/integrations/autotask/create-webhook', { url: webhookUrl });

      console.log('Webhook creation response:', response.data);

      // Check if the webhook was created but not activated
      if (response.data.success && response.data.is_active === false) {
        setWarning(true);
        setWarningMessage(
          `Webhook created but not activated. This means Autotask created the webhook but it may not be sending tickets. ` +
          `Webhook ID: ${response.data.webhook_id}. ` +
          `Please check your Autotask settings and ensure the URL ${webhookUrl} is accessible from the internet.`
        );
      } else if (response.data.success) {
        // Webhook created and activated successfully
        setSuccessMessage(
          `Autotask webhook created successfully. ${response.data.webhook_id ? `Webhook ID: ${response.data.webhook_id}` : ''} ` +
          `${response.data.is_active ? 'The webhook is active and ready to receive tickets.' : ''}`
        );
        setSuccess(true);
      } else {
        // API returned success: false
        setError(`Failed to create Autotask webhook: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating Autotask webhook:', error);
      setError(`Failed to create Autotask webhook: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleRemoveAutotaskWebhook = async () => {
    try {
      console.log('Removing Autotask webhook');

      // Call the API to delete the webhook
      const response = await axios.delete('/api/integrations/autotask/webhook');

      console.log('Webhook removal response:', response.data);

      // Show success message
      setSuccessMessage(`Autotask webhook removed successfully: ${response.data.message}`);
      setSuccess(true);
    } catch (error) {
      console.error('Error removing Autotask webhook:', error);
      setError(`Failed to remove Autotask webhook: ${error.response?.data?.message || error.message || 'Unknown error'}`);
    }
  };

  const handleDattoRmmConnect = async () => {
    // Open the dialog to collect Datto RMM settings
    setDattoRmmDialogOpen(true);
  }

  const handleDattoRmmSubmit = async () => {
      try {
          setLoading(true);
          setError('');

          // Validate required fields
          if (!dattoRmmSettings.apiKey || !dattoRmmSettings.apiSecretKey || !dattoRmmSettings.apiUrl) {
              setError('API Key, API Secret Key, and API URL are required');
              return;
          }

          // Save the integration with the collected settings
          await axios.post('/api/integrations/datto/setup', dattoRmmSettings);

          // Close the dialog
          setDattoRmmDialogOpen(false);

          // Refresh the integrations list
          fetchIntegrations();
          setSuccessMessage('Datto RMM integration connected successfully');
          setSuccess(true);
      } catch (error) {
          console.error('Error connecting to Datto RMM:', error);
          setError('Failed to connect to Datto RMM. Please try again.');
      } finally {
          setLoading(false);
      }
  }



  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Find MS365 and Autotask PSA integrations if they exist
  const ms365Integration = integrations.find(integration => integration.integration_type === 'ms365');
  const autotaskIntegration = integrations.find(integration => integration.integration_type === 'autotask_psa');

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" gutterBottom>
        Integrations
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Connect and manage your external service integrations.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="integration tabs">
          <Tab label="Available Integrations" />
          <Tab label="Connected Integrations" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Microsoft 365" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect to Microsoft 365 to sync your calendar, working hours, and more.
                </Typography>
                {ms365Integration !== undefined ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LinkIcon />}
                    disabled={true}
                  >
                    Connected
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleConnectMS365}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Add more integration options here */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Google Workspace" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect to Google Workspace to sync your calendar, contacts, and more.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<LinkIcon />}
                  disabled={true}
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Autotask PSA" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect to Autotask PSA to sync your tickets, contacts, and more.
                </Typography>
                {autotaskIntegration !== undefined ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LinkIcon />}
                    disabled={true}
                  >
                    Connected
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleConnectAutotask}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Microsoft Teams" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect to Microsoft Teams to receive notifications and alerts.
                </Typography>
                {integrations.find(integration => integration.integration_type === 'teams' || integration.integration_type === 'teamscommand') !== undefined ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LinkIcon />}
                    disabled={true}
                  >
                    Connected
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleConnectTeams}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="OpenAI" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Connect to OpenAI to chat with an AI assistant and use AI features.
                </Typography>
                {integrations.find(integration => integration.integration_type === 'openai') !== undefined ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LinkIcon />}
                    disabled={true}
                  >
                    Connected
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleConnectOpenAI}
                  >
                    Connect
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
            <Grid item xs={12} md={6}>
            <Card>
                <CardHeader title="Datto RMM" />
                <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Connect to Datto RMM to manage your devices and sync data.
                    </Typography>
                    {integrations.find(integration => integration.integration_type === 'datto_rmm') !== undefined ? (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<LinkIcon />}
                    disabled={true}
                  >
                    Connected
                  </Button> ):(
                    <Button
                        variant="contained"
                        startIcon={<LinkIcon />}
                        onClick={handleDattoRmmConnect}
                    >
                        Connect
                    </Button>)}
                </CardContent>
            </Card>
            </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {integrations.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No integrations connected. Go to the "Available Integrations" tab to connect services.
            </Typography>
          </Paper>
        ) : (
          <List>
            {integrations.map((integration) => (
              <Paper key={integration.id} sx={{ mb: 2 }}>
                <ListItem>
                  <ListItemIcon>
                    {integration.integration_type === 'ms365' && <CloudIcon color="primary" />}
                    {integration.integration_type === 'autotask_psa' && <SettingsIcon color="primary" />}
                    {integration.integration_type === 'teams' && <ChatIcon color="primary" />}
                    {integration.integration_type === 'openai' && <AIIcon color="primary" />}
                    {integration.integration_type === 'datto_rmm' && <CloudIcon color="primary" />}
                    {integration.integration_type === 'teamscommand' && <ChatIcon color="primary" />}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      integration.integration_type === 'ms365'
                        ? 'Microsoft 365'
                        : integration.integration_type === 'autotask_psa'
                          ? 'Autotask PSA'
                          : integration.integration_type === 'teams'
                            ? 'Microsoft Teams'
                            : integration.integration_type === 'openai'
                              ? 'OpenAI'
                              : integration.integration_type
                    }
                    secondary={`Connected on ${new Date(integration.created_at).toLocaleDateString()}`}
                  />
                  <ListItemSecondaryAction>
                    {integration.integration_type === 'ms365' && (
                      <>
                        <IconButton
                          edge="end"
                          aria-label="sync calendar"
                          onClick={() => handleSyncMS365('calendar')}
                          title="Sync Calendar"
                        >
                          <RefreshIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditClick(integration)}
                          title="Edit Settings"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteIntegration(integration.id, integration.integration_type)}
                          title="Delete Integration"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {integration.integration_type === 'autotask_psa' && (
                      <>
                        <IconButton
                          edge="end"
                          aria-label="sync tickets"
                          onClick={handleSyncAutotask}
                          title="Sync Tickets"
                        >
                          <RefreshIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="force full sync tickets"
                          onClick={handleForceFullSyncAutotask}
                          title="Force Full Sync (All Tickets)"
                        >
                          <RefreshIcon sx={{ color: 'primary.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="sync open tickets"
                          onClick={handleSyncActiveAutotask}
                          title="Sync Open Tickets"
                        >
                          <RefreshIcon sx={{ color: 'success.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="sync companies"
                          onClick={handleSyncCompaniesAutotask}
                          title="Sync Companies"
                        >
                          <RefreshIcon sx={{ color: 'info.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="sync contacts"
                          onClick={handleSyncContactsAutotask}
                          title="Sync Contacts"
                        >
                          <RefreshIcon sx={{ color: 'warning.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="sync last active"
                          onClick={handleSyncLastActiveAutotask}
                          title="Sync Last Active"
                        >
                          <RefreshIcon sx={{ color: 'secondary.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="create webhook"
                          onClick={handleCreateAutotaskWebhook}
                          title="Create/Recreate Webhook"
                        >
                          <LinkIcon sx={{ color: 'primary.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="remove webhook"
                          onClick={handleRemoveAutotaskWebhook}
                          title="Remove Webhook"
                        >
                          <DeleteIcon sx={{ color: 'error.main' }} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditClick(integration)}
                          title="Edit Settings"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteIntegration(integration.id, integration.integration_type)}
                          title="Delete Integration"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {integration.integration_type === 'teams' && (
                      <>
                        <IconButton
                          edge="end"
                          aria-label="send test message"
                          onClick={handleSendTeamsTestMessage}
                          title="Send Test Message"
                        >
                          <SendIcon color="primary" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditClick(integration)}
                          title="Edit Settings"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteIntegration(integration.id, 'teams')}
                          title="Delete Integration"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                    {integration.integration_type === 'openai' && (
                      <>
                        <IconButton
                          edge="end"
                          aria-label="chat with ai"
                          onClick={() => navigate('/chat-with-ai')}
                          title="Chat with AI"
                        >
                          <ChatIcon color="primary" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="edit"
                          onClick={() => handleEditClick(integration)}
                          title="Edit Settings"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleDeleteIntegration(integration.id, 'openai')}
                          title="Delete Integration"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Edit Integration Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentIntegration?.integration_type === 'ms365'
            ? 'Microsoft 365 Settings'
            : currentIntegration?.integration_type === 'autotask_psa'
              ? 'Autotask PSA Settings'
              : currentIntegration?.integration_type === 'openai'
                ? 'Azure OpenAI Settings'
                : 'Integration Settings'
          }
        </DialogTitle>
        <DialogContent>
          {currentIntegration?.integration_type === 'ms365' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Calendar Sync Enabled"
                  select
                  SelectProps={{ native: true }}
                  value={currentIntegration.settings.calendarSyncEnabled || 'true'}
                  onChange={(e) => handleSettingChange('calendarSyncEnabled', e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Working Hours Sync Enabled"
                  select
                  SelectProps={{ native: true }}
                  value={currentIntegration.settings.workingHoursSyncEnabled || 'true'}
                  onChange={(e) => handleSettingChange('workingHoursSyncEnabled', e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Auto Sync Interval (minutes)"
                  type="number"
                  value={currentIntegration.settings.autoSyncInterval || 60}
                  onChange={(e) => handleSettingChange('autoSyncInterval', e.target.value)}
                  InputProps={{ inputProps: { min: 15, max: 1440 } }}
                />
              </Grid>
            </Grid>
          )}

          {currentIntegration?.integration_type === 'autotask_psa' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Username"
                  value={currentIntegration.settings.username || ''}
                  onChange={(e) => handleSettingChange('username', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Password"
                  type="password"
                  value={currentIntegration.settings.password || ''}
                  onChange={(e) => handleSettingChange('password', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="API URL"
                  value={currentIntegration.settings.apiUrl || ''}
                  onChange={(e) => handleSettingChange('apiUrl', e.target.value)}
                  placeholder="https://webservices.autotask.net/atservices/1.0/"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Integration Code"
                  value={currentIntegration.settings.integrationCode || ''}
                  onChange={(e) => handleSettingChange('integrationCode', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Auto Sync Enabled"
                  select
                  SelectProps={{ native: true }}
                  value={currentIntegration.settings.autoSyncEnabled || 'true'}
                  onChange={(e) => handleSettingChange('autoSyncEnabled', e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sync Interval (minutes)"
                  type="number"
                  value={currentIntegration.settings.syncInterval || 60}
                  onChange={(e) => handleSettingChange('syncInterval', e.target.value)}
                  InputProps={{ inputProps: { min: 15, max: 1440 } }}
                />
              </Grid>
            </Grid>
          )}

          {currentIntegration?.integration_type === 'teams' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The Teams integration allows you to receive notifications and alerts through Microsoft Teams.
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  To test this integration, click the "Send Test Message" button in the connected integrations list.
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notifications Enabled"
                  select
                  SelectProps={{ native: true }}
                  value={currentIntegration.settings.notificationsEnabled || 'true'}
                  onChange={(e) => handleSettingChange('notificationsEnabled', e.target.value)}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </TextField>
              </Grid>
            </Grid>
          )}

          {currentIntegration?.integration_type === 'openai' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" paragraph>
                  The Azure OpenAI integration allows you to chat with an AI assistant and use AI features.
                </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Your Azure OpenAI settings are stored securely and used only for your account.
                </Alert>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="API Key"
                  type="password"
                  value={currentIntegration.settings.api_key || ''}
                  onChange={(e) => handleSettingChange('api_key', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Base URL"
                  placeholder="https://your-resource-name.openai.azure.com"
                  value={currentIntegration.settings.base_url || ''}
                  onChange={(e) => handleSettingChange('base_url', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="API Version"
                  placeholder="2025-01-01-preview"
                  value={currentIntegration.settings.api_version || '2025-01-01-preview'}
                  onChange={(e) => handleSettingChange('api_version', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Model"
                  select
                  SelectProps={{ native: true }}
                  value={currentIntegration.settings.model || 'gpt-4'}
                  onChange={(e) => handleSettingChange('model', e.target.value)}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </TextField>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancel</Button>
          <Button onClick={handleSaveSettings} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Autotask PSA Settings Dialog */}
      <Dialog open={autotaskDialogOpen} onClose={handleAutotaskDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Autotask PSA Connection Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Username"
                name="username"
                value={autotaskSettings.username}
                onChange={handleAutotaskSettingsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type="password"
                value={autotaskSettings.password}
                onChange={handleAutotaskSettingsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="API URL"
                name="apiUrl"
                value={autotaskSettings.apiUrl}
                onChange={handleAutotaskSettingsChange}
                placeholder="https://webservices.autotask.net/atservices/1.0/"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Integration Code"
                name="integrationCode"
                value={autotaskSettings.integrationCode}
                onChange={handleAutotaskSettingsChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAutotaskDialogClose}>Cancel</Button>
          <Button onClick={handleAutotaskSubmit} variant="contained" color="primary">
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* Teams Settings Dialog */}
      <Dialog open={teamsDialogOpen} onClose={handleTeamsDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>Microsoft Teams Connection</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 2 }}>
            The Teams integration allows you to receive notifications and alerts through Microsoft Teams.
            The connection is automatically established when you interact with the bot in Teams.
          </Typography>

          <Alert severity="warning" sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold">Important:</Typography>
            <Typography>
              You must interact with the Rabbitai bot in Microsoft Teams <strong>before</strong> you can send test messages or receive notifications.
              This is required because Microsoft Teams needs to establish a secure connection between your account and our application.
            </Typography>
          </Alert>

          <Typography variant="h6" gutterBottom>How to set up the Teams integration:</Typography>

          <Box component="ol" sx={{ ml: 2, mb: 3 }}>
            <li>
              <Typography paragraph>
                <strong>Find the Rabbitai bot in Teams:</strong> Search for "Rabbitai" in the Teams search bar and select the bot from the results.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Send a message to the bot:</strong> Send any message (like "Hello" or "Hi") to the bot to establish the connection.
              </Typography>
            </li>
            <li>
              <Typography paragraph>
                <strong>Return to this page:</strong> After interacting with the bot, click the "Connect" button below to complete the setup.
              </Typography>
            </li>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography>
              If you've already interacted with the Rabbitai bot in Teams, you can click "Connect" below to complete the integration.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTeamsDialogClose}>Cancel</Button>
          <Button onClick={handleTeamsSubmit} variant="contained" color="primary">
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* OpenAI Settings Dialog */}
      <Dialog open={openaiDialogOpen} onClose={handleOpenaiDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Azure OpenAI Connection Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Connect to Azure OpenAI to chat with an AI assistant and use AI features.
              </Typography>
              <Alert severity="info" sx={{ mb: 2 }}>
                Your Azure OpenAI settings are stored securely and used only for your account.
              </Alert>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="API Key"
                name="api_key"
                type="password"
                value={openaiSettings.api_key}
                onChange={handleOpenaiSettingsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Base URL"
                name="base_url"
                placeholder="https://your-resource-name.openai.azure.com"
                value={openaiSettings.base_url}
                onChange={handleOpenaiSettingsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="API Version"
                name="api_version"
                placeholder="2023-12-01-preview"
                value={openaiSettings.api_version}
                onChange={handleOpenaiSettingsChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Model"
                name="model"
                select
                SelectProps={{ native: true }}
                value={openaiSettings.model}
                onChange={handleOpenaiSettingsChange}
              >
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOpenaiDialogClose}>Cancel</Button>
          <Button onClick={handleOpenaiSubmit} variant="contained" color="primary">
            Connect
          </Button>
        </DialogActions>
      </Dialog>


        {/* Datto RMM Settings Dialog */}
        <Dialog open={dattoRmmDialogOpen} onClose={() => setDattoRmmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Datto RMM Connection Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="API Key"
                value={dattoRmmSettings.apiKey}
                onChange={(e) => setDattoRmmSettings({ ...dattoRmmSettings, apiKey: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="API Secret Key"
                type="password"
                value={dattoRmmSettings.apiSecretKey}
                onChange={(e) => setDattoRmmSettings({ ...dattoRmmSettings, apiSecretKey: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="API URL"
                value={dattoRmmSettings.apiUrl}
                onChange={(e) => setDattoRmmSettings({ ...dattoRmmSettings, apiUrl: e.target.value })}
              />
            </Grid>
          </Grid>
      <Snackbar open={success} autoHideDuration={3000} onClose={() => setSuccess(false)}>
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={warning} autoHideDuration={6000} onClose={() => setWarning(false)}>
        <Alert onClose={() => setWarning(false)} severity="warning" sx={{ width: '100%' }}>
          {warningMessage}
        </Alert>
      </Snackbar>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDattoRmmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDattoRmmSubmit} variant="contained" color="primary">
            Connect
          </Button>
        </DialogActions>
        </Dialog>
    </Box>
  );
}
