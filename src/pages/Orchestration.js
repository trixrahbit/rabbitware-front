import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Switch,
  FormControlLabel,
  Autocomplete,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Code as CodeIcon,
  Webhook as WebhookIcon,
  Bolt as BoltIcon,
  AutoFixHigh as AutoFixHighIcon,
  ArrowBack as ArrowBackIcon,
  Person as PersonIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orchestration-tabpanel-${index}`}
      aria-labelledby={`orchestration-tab-${index}`}
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

export default function Orchestration() {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [scripts, setScripts] = useState([]);
  const [webhooks, setWebhooks] = useState([]);
  const [triggers, setTriggers] = useState([]);
  const [orchestrations, setOrchestrations] = useState([]);
  const [tags, setTags] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  const [accessError, setAccessError] = useState('');

  // Dialog states
  const [scriptDialogOpen, setScriptDialogOpen] = useState(false);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [orchestrationDialogOpen, setOrchestrationDialogOpen] = useState(false);

  // Form data states
  const [scriptFormData, setScriptFormData] = useState({
    name: '',
    description: '',
    script_content: '',
    script_type: 'powershell',
    script_purpose: 'general',
    parameters: [],
    tag_ids: []
  });

  const [webhookFormData, setWebhookFormData] = useState({
    name: '',
    description: '',
    url: '',
    method: 'POST',
    headers: {},
    body_template: '',
    auth_type: 'none',
    auth_credentials: {},
    tag_ids: []
  });

  const [triggerFormData, setTriggerFormData] = useState({
    name: '',
    description: '',
    trigger_type: 'schedule',
    trigger_config: {},
    datasource_id: null,
    is_active: true,
    tag_ids: []
  });

  const [orchestrationFormData, setOrchestrationFormData] = useState({
    name: '',
    description: '',
    trigger_id: '',
    webhook_id: '',
    script_id: '',
    execution_order: 'webhook_then_script',
    is_active: true,
    tag_ids: []
  });



  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    fetchData();

    // Check for tab query parameter
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');

    if (tabParam) {
      switch (tabParam.toLowerCase()) {
        case 'scripts':
          setTabValue(1);
          break;
        case 'webhooks':
          setTabValue(2);
          break;
        case 'triggers':
          setTabValue(3);
          break;
        case 'self-healing':
          setTabValue(5);
          break;
        default:
          setTabValue(0); // Default to Orchestrations tab
      }
    }
  }, [location.search]); // Re-run when URL query parameters change

  const fetchData = async () => {
    setLoading(true);
    try {
      // Execute each fetch function individually to prevent one failure from affecting others
      try {
        await fetchScripts();
      } catch (error) {
        console.error('Error in fetchScripts:', error);
      }

      try {
        await fetchWebhooks();
      } catch (error) {
        console.error('Error in fetchWebhooks:', error);
      }

      try {
        await fetchTriggers();
      } catch (error) {
        console.error('Error in fetchTriggers:', error);
      }

      try {
        await fetchOrchestrations();
      } catch (error) {
        console.error('Error in fetchOrchestrations:', error);
      }

      try {
        await fetchTags();
      } catch (error) {
        console.error('Error in fetchTags:', error);
      }


    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await axios.get('/api/orchestration/scripts');
      setScripts(response.data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      // Return empty array on error to prevent app from crashing
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setScripts([]);
    }
  };

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get('/api/orchestration/webhooks');
      setWebhooks(response.data);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      // Return empty array on error to prevent app from crashing
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setWebhooks([]);
    }
  };

  const fetchTriggers = async () => {
    try {
      const response = await axios.get('/api/orchestration/triggers');
      setTriggers(response.data);
    } catch (error) {
      console.error('Error fetching triggers:', error);
      // Return empty array on error to prevent app from crashing
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setTriggers([]);
    }
  };

  const fetchOrchestrations = async () => {
    try {
      const response = await axios.get('/api/orchestration/orchestrations');
      setOrchestrations(response.data);
    } catch (error) {
      console.error('Error fetching orchestrations:', error);
      // Return empty array on error to prevent app from crashing
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setOrchestrations([]);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'orchestration' }
      });
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };



  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    // Update URL to reflect selected tab
    const params = new URLSearchParams(window.location.search);

    if (newValue === 0) {
      // For the main Orchestrations tab, remove the tab parameter
      params.delete('tab');
    } else {
      // For other tabs, set the tab parameter
      const tabNames = ['orchestrations', 'scripts', 'webhooks', 'triggers'];
      params.set('tab', tabNames[newValue]);
    }

    // Update the URL without reloading the page
    const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
    window.history.pushState({}, '', newUrl);
  };

  const handleMenuClick = (event, item, type) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
    setSelectedItemType(type);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = async () => {
    handleMenuClose();

    try {
      // Open the appropriate edit dialog based on the selected item type
      switch (selectedItemType) {
        case 'script':
          // Fetch the script details
          try {
            const response = await axios.get(`/api/orchestration/scripts/${selectedItem.id}`);
            if (response.data) {
              // Set the form data with the script details
              setScriptFormData({
                name: response.data.name,
                description: response.data.description || '',
                script_content: response.data.script_content,
                script_type: response.data.script_type,
                script_purpose: response.data.script_purpose || 'general',
                parameters: response.data.parameters || [],
                target_scope: response.data.target_scope,
                target_id: response.data.target_id,
                tag_ids: response.data.tag_ids,
                folder_ids: response.data.folder_ids
              });
              // Open the script dialog in edit mode
              setEditMode(true);
              setEditItemId(selectedItem.id);
              setScriptDialogOpen(true);
            }
          } catch (error) {
            console.error(`Error fetching script details:`, error);
            alert(`Error fetching script details: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
          }
          break;
        case 'webhook':
          // Fetch the webhook details
          try {
            const response = await axios.get(`/api/orchestration/webhooks/${selectedItem.id}`);
            if (response.data) {
              // Set the form data with the webhook details
              setWebhookFormData({
                name: response.data.name,
                description: response.data.description || '',
                url: response.data.url,
                method: response.data.method || 'POST',
                headers: response.data.headers || {},
                body_template: response.data.body_template || '',
                auth_type: response.data.auth_type || 'none',
                auth_credentials: response.data.auth_credentials || {},
                tag_ids: response.data.tag_ids,
                folder_ids: response.data.folder_ids
              });
              // Open the webhook dialog in edit mode
              setEditMode(true);
              setEditItemId(selectedItem.id);
              setWebhookDialogOpen(true);
            }
          } catch (error) {
            console.error(`Error fetching webhook details:`, error);
            alert(`Error fetching webhook details: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
          }
          break;
        case 'trigger':
          // Fetch the trigger details
          try {
            const response = await axios.get(`/api/orchestration/triggers/${selectedItem.id}`);
            if (response.data) {
              // Set the form data with the trigger details
              setTriggerFormData({
                name: response.data.name,
                description: response.data.description || '',
                trigger_type: response.data.trigger_type,
                trigger_config: response.data.trigger_config || {},
                datasource_id: response.data.datasource_id,
                profile_id: response.data.profile_id,
                is_active: response.data.is_active !== false,
                tag_ids: response.data.tag_ids,
                folder_ids: response.data.folder_ids
              });
              // Open the trigger dialog in edit mode
              setEditMode(true);
              setEditItemId(selectedItem.id);
              setTriggerDialogOpen(true);
            }
          } catch (error) {
            console.error(`Error fetching trigger details:`, error);
            alert(`Error fetching trigger details: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
          }
          break;
        case 'orchestration':
          // Fetch the orchestration details
          try {
            const response = await axios.get(`/api/orchestration/orchestrations/${selectedItem.id}`);
            if (response.data) {
              // Set the form data with the orchestration details
              setOrchestrationFormData({
                name: response.data.name,
                description: response.data.description || '',
                trigger_id: response.data.trigger_id,
                webhook_id: response.data.webhook_id,
                script_id: response.data.script_id,
                execution_order: response.data.execution_order || 'webhook_then_script',
                is_active: response.data.is_active !== false,
                tag_ids: response.data.tag_ids,
                folder_ids: response.data.folder_ids
              });
              // Open the orchestration dialog in edit mode
              setEditMode(true);
              setEditItemId(selectedItem.id);
              setOrchestrationDialogOpen(true);
            }
          } catch (error) {
            console.error(`Error fetching orchestration details:`, error);
            alert(`Error fetching orchestration details: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
          }
          break;
        default:
          // If we get here, just do nothing
          break;
      }
    } catch (error) {
      console.error(`Error in handleEditClick:`, error);
      alert(`An unexpected error occurred: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleDelete = async () => {
    try {
      let endpoint;
      let refreshFunction;

      switch (selectedItemType) {
        case 'script':
          endpoint = `/api/orchestration/scripts/${selectedItem.id}`;
          refreshFunction = fetchScripts;
          break;
        case 'webhook':
          endpoint = `/api/orchestration/webhooks/${selectedItem.id}`;
          refreshFunction = fetchWebhooks;
          break;
        case 'trigger':
          endpoint = `/api/orchestration/triggers/${selectedItem.id}`;
          refreshFunction = fetchTriggers;
          break;
        case 'orchestration':
          endpoint = `/api/orchestration/orchestrations/${selectedItem.id}`;
          refreshFunction = fetchOrchestrations;
          break;
        default:
          throw new Error('Unknown item type');
      }

      try {
        await axios.delete(endpoint);
        await refreshFunction();
        setOpenDeleteDialog(false);
      } catch (error) {
        console.error(`Error deleting ${selectedItemType}:`, error);
        // Show error message to user
        alert(`Error deleting ${selectedItemType}: ${error.response?.data?.detail || error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error(`Unexpected error in handleDelete:`, error);
      alert(`An unexpected error occurred while trying to delete the ${selectedItemType}`);
    }
  };

  const handleExecuteClick = () => {
    setExecuteDialogOpen(true);
    handleMenuClose();
  };

  const handleExecuteDialogClose = () => {
    setExecuteDialogOpen(false);
    setExecutionResult(null);
  };

  const handleExecute = async () => {
    try {
      setExecutionLoading(true);
      let endpoint;

      switch (selectedItemType) {
        case 'script':
          endpoint = `/api/orchestration/scripts/${selectedItem.id}/execute`;
          break;
        case 'webhook':
          endpoint = `/api/orchestration/webhooks/${selectedItem.id}/execute`;
          break;
        case 'orchestration':
          endpoint = `/api/orchestration/orchestrations/${selectedItem.id}/execute`;
          break;
        case 'selfHealingJob':
          endpoint = `/api/self-healing/jobs/${selectedItem.id}/execute`;
          break;
        default:
          throw new Error('Cannot execute this item type');
      }

      try {
        const response = await axios.post(endpoint);
        setExecutionResult(response.data);
      } catch (error) {
        console.error(`Error executing ${selectedItemType}:`, error);
        setExecutionResult({
          success: false,
          error: error.response?.data?.detail || error.message || `Failed to execute ${selectedItemType}`
        });
      }
    } catch (error) {
      console.error(`Unexpected error in handleExecute:`, error);
      setExecutionResult({
        success: false,
        error: 'An unexpected error occurred'
      });
    } finally {
      setExecutionLoading(false);
    }
  };

  const handleCreateClick = (type) => {
    try {
      // Reset form data and open the appropriate dialog
      switch (type) {
        case 'script':
          setScriptFormData({
            name: '',
            description: '',
            script_content: '',
            script_type: 'powershell',
            script_purpose: 'general',
            parameters: []
          });
          setScriptDialogOpen(true);
          break;
        case 'webhook':
          setWebhookFormData({
            name: '',
            description: '',
            url: '',
            method: 'POST',
            headers: {},
            body_template: '',
            auth_type: 'none',
            auth_credentials: {}
          });
          setWebhookDialogOpen(true);
          break;
        case 'trigger':
          setTriggerFormData({
            name: '',
            description: '',
            trigger_type: 'schedule',
            trigger_config: {},
            datasource_id: null,
            is_active: true
          });
          setTriggerDialogOpen(true);
          break;
        case 'orchestration':
          setOrchestrationFormData({
            name: '',
            description: '',
            trigger_id: '',
            webhook_id: '',
            script_id: '',
            execution_order: 'webhook_then_script',
            is_active: true
          });
          setOrchestrationDialogOpen(true);
          break;
        default:
          console.error(`Unknown type: ${type}`);
          break;
      }
    } catch (error) {
      console.error(`Error in handleCreateClick:`, error);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  // Dialog close handlers
  const handleScriptDialogClose = () => {
    setScriptDialogOpen(false);
    setEditMode(false);
    setEditItemId(null);
    // Reset form data
    setScriptFormData({
      name: '',
      description: '',
      script_content: '',
      script_type: 'powershell',
      script_purpose: 'general',
      parameters: []
    });
  };

  const handleWebhookDialogClose = () => {
    setWebhookDialogOpen(false);
    setEditMode(false);
    setEditItemId(null);
    // Reset form data
    setWebhookFormData({
      name: '',
      description: '',
      url: '',
      method: 'POST',
      headers: {},
      body_template: '',
      auth_type: 'none',
      auth_credentials: {}
    });
  };

  const handleTriggerDialogClose = () => {
    setTriggerDialogOpen(false);
    setEditMode(false);
    setEditItemId(null);
    // Reset form data
    setTriggerFormData({
      name: '',
      description: '',
      trigger_type: 'schedule',
      trigger_config: {
        frequency: 'daily',
        time: '12:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      },
      datasource_id: null,
      profile_id: null,
      is_active: true
    });
  };

  const handleOrchestrationDialogClose = () => {
    setOrchestrationDialogOpen(false);
    setEditMode(false);
    setEditItemId(null);
    // Reset form data
    setOrchestrationFormData({
      name: '',
      description: '',
      trigger_id: '',
      webhook_id: '',
      script_id: '',
      execution_order: 'webhook_then_script',
      is_active: true
    });
  };



  // Form input change handlers
  const handleScriptFormChange = (e) => {
    const { name, value } = e.target;
    setScriptFormData({
      ...scriptFormData,
      [name]: value
    });
  };

  const handleWebhookFormChange = (e) => {
    const { name, value } = e.target;
    setWebhookFormData({
      ...webhookFormData,
      [name]: value
    });
  };

  const handleTriggerFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'is_active') {
      setTriggerFormData({
        ...triggerFormData,
        [name]: e.target.checked
      });
      return;
    }

    if (name === 'trigger_type') {
      // Reset trigger_config when trigger_type changes
      let defaultConfig = {};

      // Set default config based on trigger type
      if (value === 'schedule') {
        defaultConfig = {
          frequency: 'daily',
          time: '12:00',
          days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
        };
      } else if (value === 'event') {
        defaultConfig = {
          event_type: 'system',
          event_name: ''
        };
      } else if (value === 'condition') {
        defaultConfig = {
          condition_type: 'data_change',
          query: ''
        };
      }

      setTriggerFormData({
        ...triggerFormData,
        [name]: value,
        trigger_config: defaultConfig
      });
      return;
    }

    setTriggerFormData({
      ...triggerFormData,
      [name]: value
    });
  };

  const handleOrchestrationFormChange = (e) => {
    const { name, value } = e.target;

    if (name === 'is_active') {
      setOrchestrationFormData({
        ...orchestrationFormData,
        [name]: e.target.checked
      });
      return;
    }

    setOrchestrationFormData({
      ...orchestrationFormData,
      [name]: value
    });
  };



  // Form submission handlers
  const handleCreateScript = async () => {
    try {
      if (editMode && editItemId) {
        // Update existing script
        const response = await axios.put(`/api/orchestration/scripts/${editItemId}`, scriptFormData);
        if (response.data) {
          fetchScripts();
          setScriptDialogOpen(false);
          setEditMode(false);
          setEditItemId(null);
        }
      } else {
        // Create new script
        const response = await axios.post('/api/orchestration/scripts', scriptFormData);
        if (response.data) {
          fetchScripts();
          setScriptDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(editMode ? 'Error updating script:' : 'Error creating script:', error);
      alert(`${editMode ? 'Error updating script:' : 'Error creating script:'} ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    }
  };

  const handleCreateWebhook = async () => {
    try {
      if (editMode && editItemId) {
        // Update existing webhook
        const response = await axios.put(`/api/orchestration/webhooks/${editItemId}`, webhookFormData);
        if (response.data) {
          fetchWebhooks();
          setWebhookDialogOpen(false);
          setEditMode(false);
          setEditItemId(null);
        }
      } else {
        // Create new webhook
        const response = await axios.post('/api/orchestration/webhooks', webhookFormData);
        if (response.data) {
          fetchWebhooks();
          setWebhookDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(editMode ? 'Error updating webhook:' : 'Error creating webhook:', error);
      alert(`${editMode ? 'Error updating webhook:' : 'Error creating webhook:'} ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    }
  };

  const handleCreateTrigger = async () => {
    try {
      if (editMode && editItemId) {
        // Update existing trigger
        const response = await axios.put(`/api/orchestration/triggers/${editItemId}`, triggerFormData);
        if (response.data) {
          fetchTriggers();
          setTriggerDialogOpen(false);
          setEditMode(false);
          setEditItemId(null);
        }
      } else {
        // Create new trigger
        const response = await axios.post('/api/orchestration/triggers', triggerFormData);
        if (response.data) {
          fetchTriggers();
          setTriggerDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(editMode ? 'Error updating trigger:' : 'Error creating trigger:', error);
      alert(`${editMode ? 'Error updating trigger:' : 'Error creating trigger:'} ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    }
  };

  const handleCreateOrchestration = async () => {
    try {
      if (editMode && editItemId) {
        // Update existing orchestration
        const response = await axios.put(`/api/orchestration/orchestrations/${editItemId}`, orchestrationFormData);
        if (response.data) {
          fetchOrchestrations();
          setOrchestrationDialogOpen(false);
          setEditMode(false);
          setEditItemId(null);
        }
      } else {
        // Create new orchestration
        const response = await axios.post('/api/orchestration/orchestrations', orchestrationFormData);
        if (response.data) {
          fetchOrchestrations();
          setOrchestrationDialogOpen(false);
        }
      }
    } catch (error) {
      console.error(editMode ? 'Error updating orchestration:' : 'Error creating orchestration:', error);
      alert(`${editMode ? 'Error updating orchestration:' : 'Error creating orchestration:'} ${error.response?.data?.detail || error.message || 'Unknown error'}`);
    }
  };



  const getItemIcon = (type) => {
    switch (type) {
      case 'script':
        return <CodeIcon color="primary" />;
      case 'webhook':
        return <WebhookIcon color="primary" />;
      case 'trigger':
        return <BoltIcon color="primary" />;
      case 'orchestration':
        return null;
      default:
        return null;
    }
  };

  if (loading) {
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Orchestration
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Orchestration</Typography>
          </Breadcrumbs>
        </Box>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackClick}
        >
          Back to Dashboard
        </Button>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage scripts, webhooks, triggers, and orchestrations to automate tasks and integrate systems.
      </Typography>

      <Paper sx={{ width: '100%', mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Orchestrations" icon={<AutoFixHighIcon />} iconPosition="start" />
          <Tab label="Scripts" icon={<CodeIcon />} iconPosition="start" />
          <Tab label="Webhooks" icon={<WebhookIcon />} iconPosition="start" />
          <Tab label="Triggers" icon={<BoltIcon />} iconPosition="start" />
        </Tabs>

        {/* Orchestrations Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleCreateClick('orchestration')}
            >
              Create Orchestration
            </Button>
          </Box>

          {orchestrations.length === 0 ? (
            <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  No Orchestrations Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get started by creating your first orchestration.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateClick('orchestration')}
                >
                  Create Orchestration
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {orchestrations.map((orchestration) => (
                <Grid item xs={12} sm={6} md={4} key={orchestration.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getItemIcon('orchestration')}
                          <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                            {orchestration.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          aria-label="orchestration menu" 
                          onClick={(e) => handleMenuClick(e, orchestration, 'orchestration')}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {orchestration.description || 'No description provided.'}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<PlayArrowIcon />}
                        onClick={() => {
                          setSelectedItem(orchestration);
                          setSelectedItemType('orchestration');
                          handleExecuteClick();
                        }}
                      >
                        Execute
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedItem(orchestration);
                          setSelectedItemType('orchestration');
                          handleEditClick();
                        }}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Scripts Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleCreateClick('script')}
            >
              Create Script
            </Button>
          </Box>

          {scripts.length === 0 ? (
            <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  No Scripts Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get started by creating your first script.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateClick('script')}
                >
                  Create Script
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {scripts.map((script) => (
                <Grid item xs={12} sm={6} md={4} key={script.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getItemIcon('script')}
                          <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                            {script.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          aria-label="script menu" 
                          onClick={(e) => handleMenuClick(e, script, 'script')}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {script.description || 'No description provided.'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type: {script.script_type}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<PlayArrowIcon />}
                        onClick={() => {
                          setSelectedItem(script);
                          setSelectedItemType('script');
                          handleExecuteClick();
                        }}
                      >
                        Execute
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedItem(script);
                          setSelectedItemType('script');
                          handleEditClick();
                        }}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Webhooks Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleCreateClick('webhook')}
            >
              Create Webhook
            </Button>
          </Box>

          {webhooks.length === 0 ? (
            <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  No Webhooks Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get started by creating your first webhook.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateClick('webhook')}
                >
                  Create Webhook
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {webhooks.map((webhook) => (
                <Grid item xs={12} sm={6} md={4} key={webhook.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getItemIcon('webhook')}
                          <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                            {webhook.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          aria-label="webhook menu" 
                          onClick={(e) => handleMenuClick(e, webhook, 'webhook')}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {webhook.description || 'No description provided.'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Method: {webhook.method} | URL: {webhook.url}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<PlayArrowIcon />}
                        onClick={() => {
                          setSelectedItem(webhook);
                          setSelectedItemType('webhook');
                          handleExecuteClick();
                        }}
                      >
                        Execute
                      </Button>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedItem(webhook);
                          setSelectedItemType('webhook');
                          handleEditClick();
                        }}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

        {/* Triggers Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={() => handleCreateClick('trigger')}
            >
              Create Trigger
            </Button>
          </Box>

          {triggers.length === 0 ? (
            <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  No Triggers Found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Get started by creating your first trigger.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateClick('trigger')}
                >
                  Create Trigger
                </Button>
              </CardActions>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {triggers.map((trigger) => (
                <Grid item xs={12} sm={6} md={4} key={trigger.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getItemIcon('trigger')}
                          <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                            {trigger.name}
                          </Typography>
                        </Box>
                        <IconButton 
                          aria-label="trigger menu" 
                          onClick={(e) => handleMenuClick(e, trigger, 'trigger')}
                          size="small"
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {trigger.description || 'No description provided.'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Type: {trigger.trigger_type} | Active: {trigger.is_active ? 'Yes' : 'No'}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => {
                          setSelectedItem(trigger);
                          setSelectedItemType('trigger');
                          handleEditClick();
                        }}
                      >
                        Edit
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>

      </Paper>

      {/* Item Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedItemType && (selectedItemType === 'script' || selectedItemType === 'webhook' || selectedItemType === 'orchestration') && (
          <MenuItem onClick={handleExecuteClick}>
            <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
            Execute
          </MenuItem>
        )}
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete {selectedItemType && selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the {selectedItemType} "{selectedItem?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execute Dialog */}
      <Dialog
        open={executeDialogOpen}
        onClose={handleExecuteDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Execute {selectedItemType && selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)}</DialogTitle>
        <DialogContent>
          {executionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : executionResult ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Result:
              </Typography>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  backgroundColor: executionResult.success ? '#f0f7f0' : '#fff0f0',
                  border: `1px solid ${executionResult.success ? '#c8e6c9' : '#ffcdd2'}`
                }}
              >
                <Typography variant="body1" gutterBottom>
                  Status: {executionResult.success ? 'Success' : 'Failed'}
                </Typography>
                {executionResult.error && (
                  <Typography variant="body2" color="error">
                    Error: {executionResult.error}
                  </Typography>
                )}
                {executionResult.result && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2">Output:</Typography>
                    <Box 
                      component="pre" 
                      sx={{ 
                        mt: 1, 
                        p: 2, 
                        backgroundColor: '#f5f5f5', 
                        borderRadius: 1,
                        overflow: 'auto',
                        maxHeight: '300px'
                      }}
                    >
                      {typeof executionResult.result === 'object' 
                        ? JSON.stringify(executionResult.result, null, 2) 
                        : executionResult.result}
                    </Box>
                  </Box>
                )}
              </Paper>
            </Box>
          ) : (
            <DialogContentText>
              Execute {selectedItemType} "{selectedItem?.name}"?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExecuteDialogClose}>
            {executionResult ? 'Close' : 'Cancel'}
          </Button>
          {!executionResult && !executionLoading && (
            <Button onClick={handleExecute} variant="contained" color="primary">
              Execute
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Script Creation Dialog */}
      <Dialog open={scriptDialogOpen} onClose={handleScriptDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Script' : 'Create Script'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Script Name"
                type="text"
                fullWidth
                variant="outlined"
                value={scriptFormData.name}
                onChange={handleScriptFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="script-type-label">Script Type</InputLabel>
                <Select
                  labelId="script-type-label"
                  id="script-type"
                  name="script_type"
                  value={scriptFormData.script_type}
                  label="Script Type"
                  onChange={handleScriptFormChange}
                >
                  <MenuItem value="powershell">PowerShell</MenuItem>
                  <MenuItem value="bash">Bash</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="javascript">JavaScript</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="script-purpose-label">Script Purpose</InputLabel>
                <Select
                  labelId="script-purpose-label"
                  id="script-purpose"
                  name="script_purpose"
                  value={scriptFormData.script_purpose}
                  label="Script Purpose"
                  onChange={handleScriptFormChange}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="detection">Detection</MenuItem>
                  <MenuItem value="remediation">Remediation</MenuItem>
                  <MenuItem value="verification">Verification</MenuItem>
                </Select>
                <FormHelperText>How this script will be used</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={scriptFormData.description}
                onChange={handleScriptFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter(tag => scriptFormData.tag_ids.includes(tag.id))}
                onChange={(e, v) => setScriptFormData({
                  ...scriptFormData,
                  tag_ids: v.map(tag => tag.id)
                })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Select tags" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Script Content
              </Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <TextField
                  name="script_content"
                  fullWidth
                  multiline
                  rows={10}
                  variant="outlined"
                  value={scriptFormData.script_content}
                  onChange={handleScriptFormChange}
                  placeholder={`# Write your ${scriptFormData.script_type} script here`}
                  required
                />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleScriptDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateScript} 
            variant="contained"
            disabled={!scriptFormData.name || !scriptFormData.script_content}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Webhook Creation Dialog */}
      <Dialog open={webhookDialogOpen} onClose={handleWebhookDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Webhook' : 'Create Webhook'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Webhook Name"
                type="text"
                fullWidth
                variant="outlined"
                value={webhookFormData.name}
                onChange={handleWebhookFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="webhook-method-label">Method</InputLabel>
                <Select
                  labelId="webhook-method-label"
                  id="webhook-method"
                  name="method"
                  value={webhookFormData.method}
                  label="Method"
                  onChange={handleWebhookFormChange}
                >
                  <MenuItem value="GET">GET</MenuItem>
                  <MenuItem value="POST">POST</MenuItem>
                  <MenuItem value="PUT">PUT</MenuItem>
                  <MenuItem value="DELETE">DELETE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={webhookFormData.description}
                onChange={handleWebhookFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter(tag => webhookFormData.tag_ids.includes(tag.id))}
                onChange={(e, v) => setWebhookFormData({
                  ...webhookFormData,
                  tag_ids: v.map(tag => tag.id)
                })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Select tags" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="url"
                label="URL"
                type="url"
                fullWidth
                variant="outlined"
                value={webhookFormData.url}
                onChange={handleWebhookFormChange}
                required
                placeholder="https://example.com/webhook"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="auth-type-label">Authentication Type</InputLabel>
                <Select
                  labelId="auth-type-label"
                  id="auth-type"
                  name="auth_type"
                  value={webhookFormData.auth_type}
                  label="Authentication Type"
                  onChange={handleWebhookFormChange}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="bearer">Bearer Token</MenuItem>
                  <MenuItem value="api_key">API Key</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Body Template (Optional)
              </Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <TextField
                  name="body_template"
                  fullWidth
                  multiline
                  rows={5}
                  variant="outlined"
                  value={webhookFormData.body_template}
                  onChange={handleWebhookFormChange}
                  placeholder='{"key": "value"}'
                />
              </Paper>
              <FormHelperText>
                JSON template for the request body. You can use variables like {'{{variableName}}'}.
              </FormHelperText>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWebhookDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateWebhook}
            variant="contained"
            disabled={!webhookFormData.name || !webhookFormData.url}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Trigger Creation Dialog */}
      <Dialog open={triggerDialogOpen} onClose={handleTriggerDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Trigger' : 'Create Trigger'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Trigger Name"
                type="text"
                fullWidth
                variant="outlined"
                value={triggerFormData.name}
                onChange={handleTriggerFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="trigger-type-label">Trigger Type</InputLabel>
                <Select
                  labelId="trigger-type-label"
                  id="trigger-type"
                  name="trigger_type"
                  value={triggerFormData.trigger_type}
                  label="Trigger Type"
                  onChange={handleTriggerFormChange}
                >
                  <MenuItem value="schedule">Schedule</MenuItem>
                  <MenuItem value="event">Event</MenuItem>
                  <MenuItem value="condition">Condition</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="profile">Profile</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={triggerFormData.description}
                onChange={handleTriggerFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter(tag => triggerFormData.tag_ids.includes(tag.id))}
                onChange={(e, v) => setTriggerFormData({
                  ...triggerFormData,
                  tag_ids: v.map(tag => tag.id)
                })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Select tags" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={triggerFormData.is_active}
                    onChange={handleTriggerFormChange}
                    name="is_active"
                  />
                }
                label="Active"
              />
            </Grid>
            {triggerFormData.trigger_type === 'schedule' && (
              <>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Schedule Configuration</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Schedule Type</InputLabel>
                    <Select
                      value={triggerFormData.trigger_config.schedule_type || 'cron'}
                      label="Schedule Type"
                      onChange={(e) => {
                        setTriggerFormData({
                          ...triggerFormData,
                          trigger_config: {
                            ...triggerFormData.trigger_config,
                            schedule_type: e.target.value
                          }
                        });
                      }}
                    >
                      <MenuItem value="cron">CRON Expression</MenuItem>
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                      <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                {triggerFormData.trigger_config.schedule_type === 'cron' && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="CRON Expression"
                      fullWidth
                      value={triggerFormData.trigger_config.cron_expression || ''}
                      onChange={(e) => {
                        setTriggerFormData({
                          ...triggerFormData,
                          trigger_config: {
                            ...triggerFormData.trigger_config,
                            cron_expression: e.target.value
                          }
                        });
                      }}
                      helperText="e.g., '0 9 * * 1,3,5' for 9:00 AM on Monday, Wednesday, Friday"
                    />
                  </Grid>
                )}
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTriggerDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateTrigger}
            variant="contained"
            disabled={!triggerFormData.name}
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Orchestration Creation Dialog */}
      <Dialog open={orchestrationDialogOpen} onClose={handleOrchestrationDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Orchestration' : 'Create Orchestration'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                autoFocus
                name="name"
                label="Orchestration Name"
                type="text"
                fullWidth
                variant="outlined"
                value={orchestrationFormData.name}
                onChange={handleOrchestrationFormChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                type="text"
                fullWidth
                variant="outlined"
                multiline
                rows={2}
                value={orchestrationFormData.description}
                onChange={handleOrchestrationFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter(tag => orchestrationFormData.tag_ids.includes(tag.id))}
                onChange={(e, v) => setOrchestrationFormData({
                  ...orchestrationFormData,
                  tag_ids: v.map(tag => tag.id)
                })}
                renderInput={(params) => (
                  <TextField {...params} label="Tags" placeholder="Select tags" />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="trigger-id-label">Trigger</InputLabel>
                <Select
                  labelId="trigger-id-label"
                  id="trigger-id"
                  name="trigger_id"
                  value={orchestrationFormData.trigger_id}
                  label="Trigger"
                  onChange={handleOrchestrationFormChange}
                >
                  <MenuItem value="">
                    <em>Select a trigger</em>
                  </MenuItem>
                  {triggers.map((trigger) => (
                    <MenuItem key={trigger.id} value={trigger.id.toString()}>
                      {trigger.name}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Select a trigger that will initiate this orchestration</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="webhook-id-label">Webhook</InputLabel>
                <Select
                  labelId="webhook-id-label"
                  id="webhook-id"
                  name="webhook_id"
                  value={orchestrationFormData.webhook_id}
                  label="Webhook"
                  onChange={handleOrchestrationFormChange}
                >
                  <MenuItem value="">
                    <em>Select a webhook (optional)</em>
                  </MenuItem>
                  {webhooks.map((webhook) => (
                    <MenuItem key={webhook.id} value={webhook.id.toString()}>
                      {webhook.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="script-id-label">Script</InputLabel>
                <Select
                  labelId="script-id-label"
                  id="script-id"
                  name="script_id"
                  value={orchestrationFormData.script_id}
                  label="Script"
                  onChange={handleOrchestrationFormChange}
                >
                  <MenuItem value="">
                    <em>Select a script (optional)</em>
                  </MenuItem>
                  {scripts.map((script) => (
                    <MenuItem key={script.id} value={script.id.toString()}>
                      {script.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="execution-order-label">Execution Order</InputLabel>
                <Select
                  labelId="execution-order-label"
                  id="execution-order"
                  name="execution_order"
                  value={orchestrationFormData.execution_order}
                  label="Execution Order"
                  onChange={handleOrchestrationFormChange}
                >
                  <MenuItem value="webhook_then_script">Webhook then Script</MenuItem>
                  <MenuItem value="script_then_webhook">Script then Webhook</MenuItem>
                  <MenuItem value="webhook_only">Webhook Only</MenuItem>
                  <MenuItem value="script_only">Script Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={orchestrationFormData.is_active}
                    onChange={handleOrchestrationFormChange}
                    name="is_active"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOrchestrationDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateOrchestration} 
            variant="contained"
            disabled={
              !orchestrationFormData.name || 
              !orchestrationFormData.trigger_id || 
              (orchestrationFormData.execution_order === 'webhook_only' && !orchestrationFormData.webhook_id) ||
              (orchestrationFormData.execution_order === 'script_only' && !orchestrationFormData.script_id) ||
              (orchestrationFormData.execution_order === 'webhook_then_script' && (!orchestrationFormData.webhook_id || !orchestrationFormData.script_id)) ||
              (orchestrationFormData.execution_order === 'script_then_webhook' && (!orchestrationFormData.webhook_id || !orchestrationFormData.script_id))
            }
          >
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>


    </Box>
  );
}
