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
  TextField,
  FormControl,
  InputLabel,
  Select,
  Breadcrumbs,
  Link,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Storage as StorageIcon,
  Api as ApiIcon,
  InsertDriveFile as FileIcon,
  ArrowBack as ArrowBackIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CodeEditor from '@uiw/react-textarea-code-editor';

export default function Datasets() {
  const [loading, setLoading] = useState(true);
  const [datasets, setDatasets] = useState([]);
  const [integrations, setIntegrations] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    integration_id: '',
    dataset_type: 'table',
    query_config: {
      query: '',
      endpoint: ''
    }
  });
  const [availableEndpoints, setAvailableEndpoints] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasets();
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await axios.get('/api/integrations');
      setIntegrations(response.data);
    } catch (error) {
      console.error('Error fetching integrations:', error);
    }
  };

  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/datasets');
      setDatasets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setLoading(false);
    }
  };

  const fetchEndpoints = async (integrationId, integrationType) => {
    try {
      // For now, we'll hardcode the endpoints based on integration type
      // In a real implementation, this would call an API endpoint
      if (integrationType === 'autotask_psa') {
        setAvailableEndpoints([
          { id: 'tickets', name: 'Tickets' },
          { id: 'companies', name: 'Companies' },
          { id: 'contracts', name: 'Contracts' }
        ]);
      } else if (integrationType === 'ms365') {
        setAvailableEndpoints([
          { id: 'calendar', name: 'Calendar' },
          { id: 'contacts', name: 'Contacts' },
          { id: 'emails', name: 'Emails' }
        ]);
      } else if (integrationType === 'teamscommand') {
        setAvailableEndpoints([
          { id: 'messages', name: 'Messages' },
          { id: 'channels', name: 'Channels' }
        ]);
      } else {
        setAvailableEndpoints([]);
      }
    } catch (error) {
      console.error('Error fetching endpoints:', error);
      setAvailableEndpoints([]);
    }
  };

  const handleMenuClick = (event, dataset) => {
    setAnchorEl(event.currentTarget);
    setSelectedDataset(dataset);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      integration_id: '',
      dataset_type: 'table',
      query_config: {
        query: '',
        endpoint: ''
      }
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = () => {
    // Initialize form data with selected dataset
    setFormData({
      name: selectedDataset.name,
      description: selectedDataset.description || '',
      integration_id: selectedDataset.integration_id.toString(),
      dataset_type: selectedDataset.dataset_type || 'table',
      query_config: selectedDataset.query_config || {
        query: '',
        endpoint: ''
      }
    });

    // Fetch endpoints for this integration
    const selectedIntegration = integrations.find(
      integration => integration.id === selectedDataset.integration_id
    );
    if (selectedIntegration) {
      fetchEndpoints(selectedDataset.integration_id, selectedIntegration.integration_type);
    }

    setIsEditing(true);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for integration_id
    if (name === 'integration_id' && value) {
      const selectedIntegration = integrations.find(integration => integration.id.toString() === value);
      if (selectedIntegration) {
        fetchEndpoints(value, selectedIntegration.integration_type);

        // Set a default name based on the integration if name is empty
        const newFormData = {
          ...formData,
          [name]: value,
          query_config: {
            ...formData.query_config,
            endpoint: '' // Reset endpoint when integration changes
          }
        };

        if (!formData.name) {
          newFormData.name = `${selectedIntegration.integration_type} Dataset`;
        }

        setFormData(newFormData);
        return;
      }
    }

    // Special handling for endpoint
    if (name === 'endpoint') {
      setFormData({
        ...formData,
        query_config: {
          ...formData.query_config,
          endpoint: value
        }
      });
      return;
    }

    // Special handling for query
    if (name === 'query') {
      setFormData({
        ...formData,
        query_config: {
          ...formData.query_config,
          query: value
        }
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    try {
      // Prepare the data to be sent
      const dataToSubmit = { ...formData };

      if (isEditing) {
        await axios.put(`/api/datasets/${selectedDataset.id}`, dataToSubmit);
      } else {
        await axios.post('/api/datasets', dataToSubmit);
      }
      fetchDatasets();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving dataset:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/datasets/${selectedDataset.id}`);
      fetchDatasets();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting dataset:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard/settings');
  };

  const getIntegrationTypeName = (integrationType) => {
    switch (integrationType) {
      case 'ms365':
        return 'Microsoft 365';
      case 'autotask_psa':
        return 'Autotask PSA';
      case 'teamscommand':
        return 'Microsoft Teams';
      default:
        return integrationType;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Datasets
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/settings">
              Settings
            </Link>
            <Typography color="text.primary">Datasets</Typography>
          </Breadcrumbs>
        </Box>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBackClick}
            sx={{ mr: 1 }}
          >
            Back
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Dataset
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage datasets from your integrations. Datasets are tables in the database that belong to a data source.
      </Typography>

      {datasets.length === 0 ? (
        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Datasets Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get started by creating your first dataset.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Dataset
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {datasets.map((dataset) => (
            <Grid item xs={12} sm={6} md={4} key={dataset.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StorageIcon color="primary" />
                      <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                        {dataset.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      aria-label="dataset menu" 
                      onClick={(e) => handleMenuClick(e, dataset)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dataset.description || 'No description provided.'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Integration: {getIntegrationTypeName(dataset.integration_type)}
                      <br />
                      Endpoint: {dataset.query_config?.endpoint || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedDataset(dataset);
                      handleEditClick();
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => {
                      setSelectedDataset(dataset);
                      handleDeleteClick();
                    }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dataset Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Dataset
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Dataset
        </MenuItem>
      </Menu>

      {/* Create/Edit Dataset Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Dataset' : 'Create Dataset'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Dataset Name"
                type="text"
                fullWidth
                variant="outlined"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="integration-label">Integration</InputLabel>
                <Select
                  labelId="integration-label"
                  id="integration-id"
                  name="integration_id"
                  value={formData.integration_id}
                  label="Integration"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>Select an integration</em>
                  </MenuItem>
                  {integrations.map((integration) => (
                    <MenuItem key={integration.id} value={integration.id.toString()}>
                      {getIntegrationTypeName(integration.integration_type)}
                    </MenuItem>
                  ))}
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
                value={formData.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required disabled={!formData.integration_id}>
                <InputLabel id="endpoint-label">Endpoint</InputLabel>
                <Select
                  labelId="endpoint-label"
                  id="endpoint"
                  name="endpoint"
                  value={formData.query_config?.endpoint || ''}
                  label="Endpoint"
                  onChange={handleInputChange}
                >
                  <MenuItem value="">
                    <em>Select an endpoint</em>
                  </MenuItem>
                  {availableEndpoints.map((endpoint) => (
                    <MenuItem key={endpoint.id} value={endpoint.id}>
                      {endpoint.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="dataset-type-label">Dataset Type</InputLabel>
                <Select
                  labelId="dataset-type-label"
                  id="dataset-type"
                  name="dataset_type"
                  value={formData.dataset_type}
                  label="Dataset Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="table">Table</MenuItem>
                  <MenuItem value="view">View</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                SQL Query (Optional)
              </Typography>
              <Paper variant="outlined" sx={{ p: 1 }}>
                <CodeEditor
                  value={formData.query_config?.query || ''}
                  language="sql"
                  placeholder="-- Write your SQL query here (e.g., SELECT * FROM tickets LEFT JOIN companies ON tickets.company_id = companies.id)"
                  onChange={(e) => handleInputChange({ target: { name: 'query', value: e.target.value } })}
                  padding={15}
                  style={{
                    fontSize: 14,
                    backgroundColor: "#f5f5f5",
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                    minHeight: 150
                  }}
                />
              </Paper>
              <Typography variant="caption" color="text.secondary">
                You can use SQL to join data from different endpoints. Leave blank to use the default query for the selected endpoint.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={
              !formData.name || 
              !formData.integration_id || 
              !formData.query_config?.endpoint
            }
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Dataset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the dataset "{selectedDataset?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
