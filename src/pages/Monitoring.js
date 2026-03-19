import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Pagination,
  Divider,
  Stack,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  Autocomplete
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  PlayArrow as ExecuteIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

export default function Monitoring() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [policies, setPolicies] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openExecuteDialog, setOpenExecuteDialog] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [executionHistory, setExecutionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [openTagDialog, setOpenTagDialog] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [accessError, setAccessError] = useState('');

  const [currentPolicy, setCurrentPolicy] = useState({
    id: null,
    name: '',
    description: '',
    script_id: '',
    target_scope: 'company',
    target_id: '',
    schedule_type: 'hourly',
    schedule_config: {},
    is_active: true,
    tag_ids: [],
    folder_ids: []
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchPolicies();
    fetchScripts();
    fetchCompanies();
    fetchDevices();
    fetchTags();
  }, []);

  // Reset target_id when target_scope changes
  useEffect(() => {
    setCurrentPolicy(prev => ({
      ...prev,
      target_id: ''
    }));
  }, [currentPolicy.target_scope]);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/monitoring/policies');
      setPolicies(response.data);
    } catch (error) {
      console.error('Error fetching monitoring policies:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      enqueueSnackbar('Failed to fetch monitoring policies', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchScripts = async () => {
    try {
      const response = await axios.get('/api/orchestration/scripts');
      // Don't filter scripts by purpose to ensure all scripts are available
      setScripts(response.data);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      enqueueSnackbar('Failed to fetch scripts', { variant: 'error' });
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies/all');
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      enqueueSnackbar('Failed to fetch companies', { variant: 'error' });
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('/api/devices');
      setDevices(response.data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      enqueueSnackbar('Failed to fetch devices', { variant: 'error' });
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'monitoring' }
      });
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      enqueueSnackbar('Failed to fetch tags', { variant: 'error' });
    }
  };

  const fetchExecutionHistory = async (policyId = null) => {
    setHistoryLoading(true);
    try {
      let url = `/api/monitoring/executions?page=${historyPage}`;
      if (policyId) {
        url += `&policy_id=${policyId}`;
      }
      const response = await axios.get(url);
      setExecutionHistory(response.data.executions);
      setHistoryTotalPages(response.data.pagination.total_pages);
    } catch (error) {
      console.error('Error fetching execution history:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      enqueueSnackbar('Failed to fetch execution history', { variant: 'error' });
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      await axios.post('/api/monitoring/policies', currentPolicy);
      enqueueSnackbar('Monitoring policy created successfully', { variant: 'success' });
      setOpenDialog(false);
      fetchPolicies();
      resetForm();
    } catch (error) {
      console.error('Error creating monitoring policy:', error);
      enqueueSnackbar('Failed to create monitoring policy', { variant: 'error' });
    }
  };

  const handleUpdatePolicy = async () => {
    try {
      await axios.put(`/api/monitoring/policies/${currentPolicy.id}`, currentPolicy);
      enqueueSnackbar('Monitoring policy updated successfully', { variant: 'success' });
      setOpenDialog(false);
      fetchPolicies();
      resetForm();
    } catch (error) {
      console.error('Error updating monitoring policy:', error);
      enqueueSnackbar('Failed to update monitoring policy', { variant: 'error' });
    }
  };

  const handleDeletePolicy = async (policyId) => {
    if (window.confirm('Are you sure you want to delete this monitoring policy?')) {
      try {
        await axios.delete(`/api/monitoring/policies/${policyId}`);
        enqueueSnackbar('Monitoring policy deleted successfully', { variant: 'success' });
        fetchPolicies();
      } catch (error) {
        console.error('Error deleting monitoring policy:', error);
        enqueueSnackbar('Failed to delete monitoring policy', { variant: 'error' });
      }
    }
  };

  const handleExecutePolicy = async () => {
    try {
      const url = `/api/monitoring/policies/${selectedPolicy.id}/execute`;
      const params = selectedDevice ? { device_id: selectedDevice.id } : {};
      const response = await axios.post(url, null, { params });
      enqueueSnackbar('Monitoring policy executed successfully', { variant: 'success' });
      setOpenExecuteDialog(false);
      console.log('Execution result:', response.data);
    } catch (error) {
      console.error('Error executing monitoring policy:', error);
      enqueueSnackbar('Failed to execute monitoring policy', { variant: 'error' });
    }
  };

  const handleOpenCreateDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (policy) => {
    setCurrentPolicy({
      ...policy,
      script_id: policy.script_id,
      target_scope: policy.target_scope,
      target_id: policy.target_id,
      schedule_type: policy.schedule_type,
      schedule_config: policy.schedule_config || {},
      tag_ids: policy.tags ? policy.tags.map(tag => tag.id) : [],
      folder_ids: policy.folders ? policy.folders.map(folder => folder.id) : []
    });
    setOpenDialog(true);
  };

  const handleOpenExecuteDialog = (policy) => {
    setSelectedPolicy(policy);
    setSelectedDevice(null);
    setOpenExecuteDialog(true);
  };

  const handleOpenHistoryDialog = (policy = null) => {
    setSelectedPolicy(policy);
    setHistoryPage(1);
    fetchExecutionHistory(policy ? policy.id : null);
    setOpenHistoryDialog(true);
  };

  const resetForm = () => {
    setCurrentPolicy({
      id: null,
      name: '',
      description: '',
      script_id: '',
      target_scope: 'company',
      target_id: '',
      schedule_type: 'hourly',
      schedule_config: {},
      is_active: true,
      tag_ids: [],
      folder_ids: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name === 'is_active') {
      setCurrentPolicy({ ...currentPolicy, [name]: checked });
    } else {
      setCurrentPolicy({ ...currentPolicy, [name]: value });
    }
  };

  const handleTagsChange = (event, newValue) => {
    setCurrentPolicy({
      ...currentPolicy,
      tag_ids: Array.isArray(newValue) ? newValue.map(tag => tag.id) : []
    });
  };

  const handleOpenCreateTagDialog = () => {
    setNewTagName('');
    setOpenTagDialog(true);
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      enqueueSnackbar('Tag name cannot be empty', { variant: 'error' });
      return;
    }

    try {
      const response = await axios.post('/api/analytics/gauge-tags', {
        name: newTagName,
        tag_type: 'monitoring'
      });

      if (response.data && response.data.id) {
        // Add the new tag to the tags list
        const newTag = {
          id: response.data.id,
          name: newTagName
        };

        setTags(prevTags => [...prevTags, newTag]);

        // Add the new tag to the selected tags
        setCurrentPolicy(prev => ({
          ...prev,
          tag_ids: [...prev.tag_ids, newTag.id]
        }));

        enqueueSnackbar('Tag created successfully', { variant: 'success' });
        setOpenTagDialog(false);
      }
    } catch (error) {
      console.error('Error creating tag:', error);
      enqueueSnackbar('Failed to create tag', { variant: 'error' });
    }
  };

  const filteredPolicies = Array.isArray(policies) ? policies.filter(policy =>
    policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Monitoring Policies
      </Typography>
      <Typography variant="body1" paragraph>
        Manage monitoring policies to run scripts on devices, companies, or tags.
      </Typography>

      {/* Actions Bar */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <TextField
          placeholder="Search policies..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchTerm('')}>
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ width: 300 }}
        />
        <Box>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => handleOpenHistoryDialog()}
            sx={{ mr: 1 }}
          >
            Execution History
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchPolicies}
            sx={{ mr: 1 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Create Policy
          </Button>
        </Box>
      </Box>

      {/* Policies Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Script</TableCell>
              <TableCell>Target</TableCell>
              <TableCell>Schedule</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredPolicies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No monitoring policies found
                </TableCell>
              </TableRow>
            ) : (
              filteredPolicies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>{policy.name}</TableCell>
                  <TableCell>{policy.description}</TableCell>
                  <TableCell>{policy.script_name}</TableCell>
                  <TableCell>
                    {policy.target_scope}: {policy.target_id}
                  </TableCell>
                  <TableCell>{policy.schedule_type}</TableCell>
                  <TableCell>
                    <Chip
                      label={policy.is_active ? 'Active' : 'Inactive'}
                      color={policy.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Execute">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenExecuteDialog(policy)}
                      >
                        <ExecuteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(policy)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePolicy(policy.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="History">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenHistoryDialog(policy)}
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Policy Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{currentPolicy.id ? 'Edit Monitoring Policy' : 'Create Monitoring Policy'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Policy Name"
                fullWidth
                value={currentPolicy.name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={currentPolicy.description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Script</InputLabel>
                <Select
                  name="script_id"
                  value={currentPolicy.script_id}
                  onChange={handleInputChange}
                  required
                >
                  {scripts.map((script) => (
                    <MenuItem key={script.id} value={script.id}>
                      {script.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Target Scope</InputLabel>
                <Select
                  name="target_scope"
                  value={currentPolicy.target_scope}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="device">Device</MenuItem>
                  <MenuItem value="tag">Tag</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Target</InputLabel>
                <Select
                  name="target_id"
                  value={currentPolicy.target_id}
                  onChange={handleInputChange}
                  required
                >
                  {currentPolicy.target_scope === 'company' && Array.isArray(companies) && companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.CompanyName}
                    </MenuItem>
                  ))}
                  {currentPolicy.target_scope === 'device' && Array.isArray(devices) && devices.map((device) => (
                    <MenuItem key={device.id} value={device.id}>
                      {device.name}
                    </MenuItem>
                  ))}
                  {currentPolicy.target_scope === 'tag' && Array.isArray(tags) && tags.map((tag) => (
                    <MenuItem key={tag.id} value={tag.id}>
                      {tag.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Schedule Type</InputLabel>
                <Select
                  name="schedule_type"
                  value={currentPolicy.schedule_type}
                  onChange={handleInputChange}
                  required
                >
                  <MenuItem value="5min">Every 5 Minutes</MenuItem>
                  <MenuItem value="15min">Every 15 Minutes</MenuItem>
                  <MenuItem value="30min">Every 30 Minutes</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="is_active"
                    checked={currentPolicy.is_active}
                    onChange={handleInputChange}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Autocomplete
                  multiple
                  options={Array.isArray(tags) ? tags : []}
                  getOptionLabel={(option) => option.name}
                  value={Array.isArray(tags) ? tags.filter(tag => currentPolicy.tag_ids.includes(tag.id)) : []}
                  onChange={handleTagsChange}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Select tags" />
                  )}
                  sx={{ flex: 1 }}
                />
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={handleOpenCreateTagDialog}
                  sx={{ ml: 1, mt: 1 }}
                >
                  Add Tag
                </Button>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={currentPolicy.id ? handleUpdatePolicy : handleCreatePolicy}
            variant="contained"
          >
            {currentPolicy.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execute Policy Dialog */}
      <Dialog open={openExecuteDialog} onClose={() => setOpenExecuteDialog(false)}>
        <DialogTitle>Execute Monitoring Policy</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Execute policy: <strong>{selectedPolicy?.name}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Device (Optional)</InputLabel>
            <Select
              value={selectedDevice?.id || ''}
              onChange={(e) => {
                const deviceId = e.target.value;
                const device = devices.find(d => d.id === deviceId);
                setSelectedDevice(device || null);
              }}
            >
              <MenuItem value="">All applicable devices</MenuItem>
              {Array.isArray(devices) && devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExecuteDialog(false)}>Cancel</Button>
          <Button onClick={handleExecutePolicy} variant="contained" color="primary">
            Execute
          </Button>
        </DialogActions>
      </Dialog>

      {/* Execution History Dialog */}
      <Dialog open={openHistoryDialog} onClose={() => setOpenHistoryDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPolicy 
            ? `Execution History for ${selectedPolicy.name}` 
            : 'All Execution History'}
        </DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : executionHistory.length === 0 ? (
            <Typography variant="body1" align="center" sx={{ p: 3 }}>
              No execution history found
            </Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Policy</TableCell>
                    <TableCell>Device</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Started</TableCell>
                    <TableCell>Completed</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {executionHistory.map((execution) => (
                    <TableRow key={execution.id}>
                      <TableCell>{execution.policy_name}</TableCell>
                      <TableCell>{execution.device_name}</TableCell>
                      <TableCell>
                        <Chip
                          label={execution.status}
                          color={
                            execution.status === 'completed' ? 'success' :
                            execution.status === 'failed' ? 'error' :
                            execution.status === 'running' ? 'warning' : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(execution.started_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {execution.completed_at 
                          ? new Date(execution.completed_at).toLocaleString() 
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {historyTotalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Pagination
                count={historyTotalPages}
                page={historyPage}
                onChange={(e, page) => {
                  setHistoryPage(page);
                  fetchExecutionHistory(selectedPolicy?.id);
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenHistoryDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Create Tag Dialog */}
      <Dialog open={openTagDialog} onClose={() => setOpenTagDialog(false)}>
        <DialogTitle>Create New Tag</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tag Name"
            fullWidth
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCreateTag();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTagDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTag} variant="contained" color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
