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
  Tooltip
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

export default function DataSources() {
  const [loading, setLoading] = useState(true);
  const [datasources, setDatasources] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDatasource, setSelectedDatasource] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    source_type: 'database',
    connection_details: {},
    query: '',
    refresh_interval: 0,
    integration_id: '',
    dataset: ''
  });
  const [integrations, setIntegrations] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDatasources();
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

  const fetchDatasets = async (integrationId, integrationType) => {
    try {
      // For now, we'll hardcode the datasets based on integration type
      // In a real implementation, this would call an API endpoint
      if (integrationType === 'autotask_psa') {
        setDatasets([
          { id: 'tickets', name: 'Tickets' },
          { id: 'companies', name: 'Companies' },
          { id: 'contacts', name: 'Contacts' },
          { id: 'queues', name: 'Queues' },
          { id: 'roles', name: 'Roles' },
          { id: 'autotaskusers', name: 'Users' }
        ]);
      } else if (integrationType === 'ms365') {
        setDatasets([
          { id: 'calendar', name: 'Calendar' },
          { id: 'contacts', name: 'Contacts' },
          { id: 'emails', name: 'Emails' }
        ]);
      } else if (integrationType === 'teamscommand') {
        setDatasets([
          { id: 'messages', name: 'Messages' },
          { id: 'channels', name: 'Channels' }
        ]);
      } else {
        setDatasets([]);
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
      setDatasets([]);
    }
  };

  const fetchDatasources = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/datasources');
      setDatasources(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching datasources:', error);
      setLoading(false);
    }
  };

  const handleMenuClick = (event, datasource) => {
    setAnchorEl(event.currentTarget);
    setSelectedDatasource(datasource);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      source_type: 'database',
      connection_details: {},
      query: '',
      refresh_interval: 0,
      integration_id: '',
      dataset: ''
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = () => {
    // Initialize form data with basic fields
    const initialFormData = {
      name: selectedDatasource.name,
      description: selectedDatasource.description || '',
      source_type: selectedDatasource.source_type,
      connection_details: selectedDatasource.connection_details || {},
      query: selectedDatasource.query || '',
      refresh_interval: selectedDatasource.refresh_interval || 0,
      integration_id: '',
      dataset: ''
    };

    // If this is an integration-based data source, extract the integration_id and dataset
    if (selectedDatasource.source_type === 'integration' && 
        selectedDatasource.connection_details && 
        selectedDatasource.connection_details.integration_id) {

      initialFormData.integration_id = selectedDatasource.connection_details.integration_id.toString();
      initialFormData.dataset = selectedDatasource.connection_details.dataset || '';

      // Fetch datasets for this integration
      const integrationId = selectedDatasource.connection_details.integration_id;
      const integrationType = selectedDatasource.connection_details.integration_type;
      if (integrationId && integrationType) {
        fetchDatasets(integrationId, integrationType);
      }
    }

    setFormData(initialFormData);
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

    // Special handling for source_type
    if (name === 'source_type') {
      // Reset integration-related fields when changing source type
      const newFormData = {
        ...formData,
        [name]: value
      };

      if (value === 'integration') {
        // Clear query when switching to integration
        newFormData.query = '';
      } else {
        // Clear integration fields when switching to other source types
        newFormData.integration_id = '';
        newFormData.dataset = '';
      }

      setFormData(newFormData);
      return;
    }

    // Special handling for integration_id
    if (name === 'integration_id' && value) {
      const selectedIntegration = integrations.find(integration => integration.id.toString() === value);
      if (selectedIntegration) {
        fetchDatasets(value, selectedIntegration.integration_type);

        // Set a default name based on the integration if name is empty
        const newFormData = {
          ...formData,
          [name]: value,
          dataset: '' // Reset dataset when integration changes
        };

        if (!formData.name) {
          newFormData.name = `${selectedIntegration.integration_type} Data Source`;
        }

        setFormData(newFormData);
        return;
      }
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

      // If source_type is integration, set the query to a reference to the integration and dataset
      if (formData.source_type === 'integration') {
        // Find the selected integration to get its type
        const selectedIntegration = integrations.find(
          integration => integration.id.toString() === formData.integration_id
        );

        if (selectedIntegration) {
          // Store integration details in connection_details
          dataToSubmit.connection_details = {
            integration_id: formData.integration_id,
            integration_type: selectedIntegration.integration_type,
            dataset: formData.dataset
          };

          // Set a query that references the integration and dataset
          // This is for backward compatibility with existing code that expects a query
          dataToSubmit.query = `SELECT * FROM ${formData.dataset} WHERE integration_id = ${formData.integration_id}`;
        }
      }

      if (isEditing) {
        await axios.put(`/api/analytics/datasources/${selectedDatasource.id}`, dataToSubmit);
      } else {
        await axios.post('/api/analytics/datasources', dataToSubmit);
      }
      fetchDatasources();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving datasource:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/analytics/datasources/${selectedDatasource.id}`);
      fetchDatasources();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting datasource:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard/analytics');
  };

  const getSourceTypeIcon = (sourceType) => {
    switch (sourceType) {
      case 'database':
        return <StorageIcon color="primary" />;
      case 'api':
        return <ApiIcon color="primary" />;
      case 'file':
        return <FileIcon color="primary" />;
      case 'integration':
        return <LinkIcon color="primary" />;
      default:
        return <StorageIcon color="primary" />;
    }
  };

  const getSourceTypeName = (sourceType) => {
    switch (sourceType) {
      case 'database':
        return 'Database';
      case 'api':
        return 'API';
      case 'file':
        return 'File';
      case 'integration':
        return 'Integration';
      default:
        return 'Unknown';
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
            Data Sources
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/analytics">
              Analytics
            </Link>
            <Typography color="text.primary">Data Sources</Typography>
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
            Create Data Source
          </Button>
        </Box>
      </Box>

      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage data sources for your analytics dashboards and widgets.
      </Typography>

      {datasources.length === 0 ? (
        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Data Sources Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get started by creating your first data source.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Data Source
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {datasources.map((datasource) => (
            <Grid item xs={12} sm={6} md={4} key={datasource.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {getSourceTypeIcon(datasource.source_type)}
                      <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                        {datasource.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      aria-label="datasource menu" 
                      onClick={(e) => handleMenuClick(e, datasource)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {datasource.description || 'No description provided.'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Type: {getSourceTypeName(datasource.source_type)}
                      {datasource.source_type === 'integration' && datasource.connection_details && (
                        <>
                          <br />
                          Integration: {
                            datasource.connection_details.integration_type === 'ms365' 
                              ? 'Microsoft 365' 
                              : datasource.connection_details.integration_type === 'autotask_psa'
                                ? 'Autotask PSA'
                                : datasource.connection_details.integration_type === 'teamscommand'
                                  ? 'Microsoft Teams'
                                  : datasource.connection_details.integration_type
                          }
                          <br />
                          Dataset: {datasource.connection_details.dataset}
                        </>
                      )}
                    </Typography>
                    {datasource.refresh_interval > 0 && (
                      <Tooltip title={`Refreshes every ${datasource.refresh_interval} minutes`}>
                        <Typography variant="caption" color="primary">
                          Auto-refresh
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedDatasource(datasource);
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
                      setSelectedDatasource(datasource);
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

      {/* Data Source Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Data Source
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Data Source
        </MenuItem>
      </Menu>

      {/* Create/Edit Data Source Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Data Source' : 'Create Data Source'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Data Source Name"
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
                <InputLabel id="source-type-label">Source Type</InputLabel>
                <Select
                  labelId="source-type-label"
                  id="source-type"
                  name="source_type"
                  value={formData.source_type}
                  label="Source Type"
                  onChange={handleInputChange}
                >
                  <MenuItem value="database">Database</MenuItem>
                  <MenuItem value="api">API</MenuItem>
                  <MenuItem value="file">File</MenuItem>
                  <MenuItem value="integration">Integration</MenuItem>
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
            {formData.source_type === 'integration' ? (
              <>
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
                          {integration.integration_type === 'ms365' 
                            ? 'Microsoft 365' 
                            : integration.integration_type === 'autotask_psa'
                              ? 'Autotask PSA'
                              : integration.integration_type === 'teamscommand'
                                ? 'Microsoft Teams'
                                : integration.integration_type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required disabled={!formData.integration_id}>
                    <InputLabel id="dataset-label">Dataset</InputLabel>
                    <Select
                      labelId="dataset-label"
                      id="dataset"
                      name="dataset"
                      value={formData.dataset}
                      label="Dataset"
                      onChange={handleInputChange}
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
                  </FormControl>
                </Grid>
              </>
            ) : (
              <Grid item xs={12}>
                <TextField
                  name="query"
                  label="Query"
                  type="text"
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={4}
                  value={formData.query}
                  onChange={handleInputChange}
                  required={formData.source_type !== 'integration'}
                  placeholder={formData.source_type === 'database' ? 'SELECT * FROM table' : 
                    formData.source_type === 'api' ? 'https://api.example.com/data' : 'path/to/file.csv'}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                name="refresh_interval"
                label="Refresh Interval (minutes)"
                type="number"
                fullWidth
                variant="outlined"
                value={formData.refresh_interval}
                onChange={handleInputChange}
                inputProps={{ min: 0 }}
                helperText="0 means no auto-refresh"
              />
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
              (formData.source_type !== 'integration' && !formData.query) ||
              (formData.source_type === 'integration' && (!formData.integration_id || !formData.dataset))
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
        <DialogTitle>Delete Data Source</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the data source "{selectedDatasource?.name}"? This action cannot be undone.
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
