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
  Breadcrumbs,
  Link,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayArrowIcon,
  Healing as HealingIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import MDDatePicker from "../components/MDDatePicker";

export default function SelfHealing() {
  const [loading, setLoading] = useState(true);
  const [selfHealingJobs, setSelfHealingJobs] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionLoading, setExecutionLoading] = useState(false);
  const [selfHealingJobDialogOpen, setSelfHealingJobDialogOpen] = useState(false);
  const [selfHealingJobFormData, setSelfHealingJobFormData] = useState({
    name: '',
    description: '',
    job_type: 'scheduled',
    detection_script_id: '',
    remediation_script_id: '',
    verification_script_id: '',
    remediation_steps: [],
    severity: 'medium',
    target_scope: 'all',
    target_id: '',
    max_attempts: 3,
    cooldown_minutes: 60,
    is_active: true
  });
  const [scripts, setScripts] = useState([]);
  const [detectionScripts, setDetectionScripts] = useState([]);
  const [remediationScripts, setRemediationScripts] = useState([]);
  const [validationScripts, setValidationScripts] = useState([]);
  const [monitoringPolicies, setMonitoringPolicies] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [devices, setDevices] = useState([]);
  const [tags, setTags] = useState([]);

  const [accessError, setAccessError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSelfHealingJobs(),
          fetchScripts(),
          fetchDetectionScripts(),
          fetchRemediationScripts(),
          fetchValidationScripts(),
          fetchMonitoringPolicies(),
          fetchCompanies(),
          fetchDevices(),
          fetchTags()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Reset target_id when target_scope changes
  useEffect(() => {
    setSelfHealingJobFormData(prev => ({
      ...prev,
      target_id: ''
    }));
  }, [selfHealingJobFormData.target_scope]);

  const fetchSelfHealingJobs = async () => {
    try {
      const response = await axios.get('/api/self-healing/jobs');
      setSelfHealingJobs(response.data);
    } catch (error) {
      console.error('Error fetching self-healing jobs:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setSelfHealingJobs([]);
    }
  };

  const fetchScripts = async () => {
    try {
      // Fetch all scripts without filtering for general use
      const response = await axios.get('/api/orchestration/scripts');
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
      setScripts([]);
    }
  };

  const fetchDetectionScripts = async () => {
    try {
      // Fetch scripts with detection purpose
      const response = await axios.get('/api/orchestration/scripts', {
        params: { script_purpose: 'detection' }
      });
      setDetectionScripts(response.data);
    } catch (error) {
      console.error('Error fetching detection scripts:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setDetectionScripts([]);
    }
  };

  const fetchRemediationScripts = async () => {
    try {
      // Fetch scripts with remediation purpose
      const response = await axios.get('/api/orchestration/scripts', {
        params: { script_purpose: 'remediation' }
      });
      setRemediationScripts(response.data);
    } catch (error) {
      console.error('Error fetching remediation scripts:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setRemediationScripts([]);
    }
  };

  const fetchValidationScripts = async () => {
    try {
      // Fetch scripts with verification purpose
      const response = await axios.get('/api/orchestration/scripts', {
        params: { script_purpose: 'verification' }
      });
      setValidationScripts(response.data);
    } catch (error) {
      console.error('Error fetching validation scripts:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setValidationScripts([]);
    }
  };

  const fetchMonitoringPolicies = async () => {
    try {
      const response = await axios.get('/api/monitoring/policies');
      setMonitoringPolicies(response.data);
    } catch (error) {
      console.error('Error fetching monitoring policies:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setMonitoringPolicies([]);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies/all');
      setCompanies(response.data || []);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setCompanies([]);
    }
  };

  const fetchDevices = async () => {
    try {
      const response = await axios.get('/api/devices');
      setDevices(response.data.devices || []);
    } catch (error) {
      console.error('Error fetching devices:', error);
      setDevices([]);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/analytics/gauge-tags', {
        params: { tag_type: 'script' }
      });
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setTags([]);
    }
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setSelfHealingJobFormData({
      name: '',
      description: '',
      job_type: 'scheduled',
      detection_script_id: '',
      remediation_script_id: '',
      verification_script_id: '',
      remediation_steps: [],
      severity: 'medium',
      target_scope: 'all',
      target_id: '',
      max_attempts: 3,
      cooldown_minutes: 60,
      is_active: true
    });
    setSelfHealingJobDialogOpen(true);
  };

  const handleEditClick = () => {
    if (!selectedItem) return;

    // Create a copy of the selected item
    const formData = {
      ...selectedItem,
      detection_script_id: selectedItem.detection_script_id || '',
      remediation_script_id: selectedItem.remediation_script_id || '',
      verification_script_id: selectedItem.verification_script_id || '',
      remediation_steps: selectedItem.remediation_steps || []
    };

    // If no remediation_steps but remediation_script_id is provided, create a single step
    if (!formData.remediation_steps || formData.remediation_steps.length === 0) {
      if (formData.remediation_script_id) {
        formData.remediation_steps = [{
          remediation_script_id: formData.remediation_script_id,
          verification_script_id: formData.verification_script_id || null,
          order: 1
        }];
      }
    }

    setSelfHealingJobFormData(formData);
    setSelfHealingJobDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleExecuteClick = () => {
    setExecuteDialogOpen(true);
    setExecutionResult(null);
    handleMenuClose();
  };

  const handleSelfHealingJobDialogClose = () => {
    setSelfHealingJobDialogOpen(false);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleExecuteDialogClose = () => {
    setExecuteDialogOpen(false);
  };

  const handleSelfHealingJobFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setSelfHealingJobFormData({
        ...selfHealingJobFormData,
        [name]: checked
      });
    } else if (name === 'max_attempts' || name === 'cooldown_minutes') {
      setSelfHealingJobFormData({
        ...selfHealingJobFormData,
        [name]: parseInt(value) || 0
      });
    } else {
      setSelfHealingJobFormData({
        ...selfHealingJobFormData,
        [name]: value
      });
    }
  };

  // Functions for managing remediation steps
  const handleAddRemediationStep = () => {
    setSelfHealingJobFormData(prev => {
      const newSteps = [...(prev.remediation_steps || [])];
      newSteps.push({
        remediation_script_id: '',
        verification_script_id: null,
        order: newSteps.length + 1
      });
      return {
        ...prev,
        remediation_steps: newSteps
      };
    });
  };

  const handleRemoveRemediationStep = (index) => {
    setSelfHealingJobFormData(prev => {
      const newSteps = [...(prev.remediation_steps || [])];
      newSteps.splice(index, 1);
      // Update order of remaining steps
      newSteps.forEach((step, i) => {
        step.order = i + 1;
      });
      return {
        ...prev,
        remediation_steps: newSteps
      };
    });
  };

  const handleMoveRemediationStep = (index, direction) => {
    setSelfHealingJobFormData(prev => {
      const newSteps = [...(prev.remediation_steps || [])];
      if (direction === 'up' && index > 0) {
        // Swap with previous step
        [newSteps[index], newSteps[index - 1]] = [newSteps[index - 1], newSteps[index]];
      } else if (direction === 'down' && index < newSteps.length - 1) {
        // Swap with next step
        [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      }
      // Update order of all steps
      newSteps.forEach((step, i) => {
        step.order = i + 1;
      });
      return {
        ...prev,
        remediation_steps: newSteps
      };
    });
  };

  const handleRemediationStepChange = (index, field, value) => {
    setSelfHealingJobFormData(prev => {
      const newSteps = [...(prev.remediation_steps || [])];
      newSteps[index] = {
        ...newSteps[index],
        [field]: value
      };
      return {
        ...prev,
        remediation_steps: newSteps
      };
    });
  };

  const handleCreateSelfHealingJob = async () => {
    try {
      // Create a copy of the form data to modify before submission
      const formData = { ...selfHealingJobFormData };

      // For event-triggered jobs, set max_attempts to null
      if (formData.job_type === 'event-triggered') {
        formData.max_attempts = null;
      }

      // Ensure remediation_steps are properly formatted for all job types
      if (formData.remediation_steps && formData.remediation_steps.length > 0) {
        // Update the order of all steps to ensure they're sequential
        formData.remediation_steps.forEach((step, i) => {
          step.order = i + 1;
        });

        // Set the legacy remediation_script_id and verification_script_id to the first step
        // for backward compatibility
        if (formData.remediation_steps.length > 0) {
          formData.remediation_script_id = formData.remediation_steps[0].remediation_script_id;
          formData.verification_script_id = formData.remediation_steps[0].verification_script_id;
        }
      }
      // If no remediation steps but remediation_script_id is provided, create a single step
      else if (formData.remediation_script_id) {
        formData.remediation_steps = [{
          remediation_script_id: formData.remediation_script_id,
          verification_script_id: formData.verification_script_id || null,
          order: 1
        }];
      }

      if (formData.id) {
        // Update existing job
        await axios.put(`/api/self-healing/jobs/${formData.id}`, formData);
      } else {
        // Create new job
        await axios.post('/api/self-healing/jobs', formData);
      }
      fetchSelfHealingJobs();
      setSelfHealingJobDialogOpen(false);
    } catch (error) {
      console.error('Error saving self-healing job:', error);
      alert('Failed to save self-healing job. Please try again.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    try {
      await axios.delete(`/api/self-healing/jobs/${selectedItem.id}`);
      fetchSelfHealingJobs();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting self-healing job:', error);
      alert('Failed to delete self-healing job. Please try again.');
    }
  };

  const handleExecuteConfirm = async () => {
    if (!selectedItem) return;

    setExecutionLoading(true);
    try {
      const response = await axios.post(`/api/self-healing/jobs/${selectedItem.id}/execute`);
      setExecutionResult(response.data);
    } catch (error) {
      console.error('Error executing self-healing job:', error);
      setExecutionResult({ 
        success: false, 
        message: 'Failed to execute self-healing job. Please try again.' 
      });
    } finally {
      setExecutionLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
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
    <Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link color="inherit" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Link>
        <Typography color="text.primary">Self-Healing</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Self-Healing
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleCreateClick}
        >
          Create Self-Healing Job
        </Button>
      </Box>

      <Paper sx={{ p: 2 }}>
        {selfHealingJobs.length === 0 ? (
          <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Self-Healing Jobs Found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get started by creating your first self-healing job.
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleCreateClick}
              >
                Create Self-Healing Job
              </Button>
            </CardActions>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {selfHealingJobs.map((job) => (
              <Grid item xs={12} sm={6} md={4} key={job.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HealingIcon color="primary" />
                        <Typography variant="h6" component="div" sx={{ ml: 1 }} noWrap>
                          {job.name}
                        </Typography>
                      </Box>
                      <IconButton 
                        aria-label="self-healing job menu" 
                        onClick={(e) => handleMenuClick(e, job)}
                        size="small"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {job.description || 'No description provided.'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Severity: {job.severity.charAt(0).toUpperCase() + job.severity.slice(1)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Target: {job.target_name || 'Unknown'}
                    </Typography>
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      startIcon={<PlayArrowIcon />}
                      onClick={() => {
                        setSelectedItem(job);
                        handleExecuteClick();
                      }}
                    >
                      Execute
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setSelectedItem(job);
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
      </Paper>

      {/* Item Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleExecuteClick}>
          <PlayArrowIcon fontSize="small" sx={{ mr: 1 }} />
          Execute
        </MenuItem>
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
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the self-healing job "{selectedItem?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">
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
        <DialogTitle>Execute Self-Healing Job</DialogTitle>
        <DialogContent>
          {executionLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : executionResult ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" color={executionResult.success ? "success.main" : "error.main"}>
                {executionResult.success ? "Success" : "Failed"}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {executionResult.message}
              </Typography>
              {executionResult.details && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, maxHeight: 300, overflow: 'auto' }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {typeof executionResult.details === 'object' 
                      ? JSON.stringify(executionResult.details, null, 2) 
                      : executionResult.details}
                  </pre>
                </Box>
              )}
            </Box>
          ) : (
            <DialogContentText>
              Are you sure you want to execute the self-healing job "{selectedItem?.name}"?
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExecuteDialogClose}>
            {executionResult ? 'Close' : 'Cancel'}
          </Button>
          {!executionResult && !executionLoading && (
            <Button onClick={handleExecuteConfirm} color="primary" variant="contained">
              Execute
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Self-Healing Job Dialog */}
      <Dialog open={selfHealingJobDialogOpen} onClose={handleSelfHealingJobDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selfHealingJobFormData.id ? 'Edit Self-Healing Job' : 'Create Self-Healing Job'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                name="name"
                value={selfHealingJobFormData.name}
                onChange={handleSelfHealingJobFormChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Job Type</InputLabel>
                <Select
                  name="job_type"
                  value={selfHealingJobFormData.job_type}
                  label="Job Type"
                  onChange={handleSelfHealingJobFormChange}
                >
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="event-triggered">Event Triggered</MenuItem>
                  <MenuItem value="manual">Manual</MenuItem>
                  <MenuItem value="monitoring-policy">Monitoring Policy</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Conditional fields based on job type */}
            {selfHealingJobFormData.job_type === 'scheduled' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <MDDatePicker
                    input={{ 
                      label: "Schedule Date/Time",
                      name: "schedule_datetime",
                      onChange: (date) => {
                        const scheduleConfig = {
                          ...(selfHealingJobFormData.schedule_config || {}),
                          datetime: date[0]?.toISOString()
                        };
                        setSelfHealingJobFormData({
                          ...selfHealingJobFormData,
                          schedule_config: scheduleConfig
                        });
                      }
                    }}
                    value={selfHealingJobFormData.schedule_config?.datetime ? [new Date(selfHealingJobFormData.schedule_config.datetime)] : []}
                    options={{
                      enableTime: true,
                      dateFormat: "Y-m-d H:i",
                    }}
                  />
                </FormControl>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selfHealingJobFormData.schedule_config?.recurring || false}
                      onChange={(e) => {
                        const scheduleConfig = {
                          ...(selfHealingJobFormData.schedule_config || {}),
                          recurring: e.target.checked
                        };
                        setSelfHealingJobFormData({
                          ...selfHealingJobFormData,
                          schedule_config: scheduleConfig
                        });
                      }}
                      name="recurring"
                    />
                  }
                  label="Recurring"
                />
              </Grid>
            )}

            {selfHealingJobFormData.job_type === 'event-triggered' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    value={selfHealingJobFormData.event_config?.event_type || ''}
                    label="Event Type"
                    onChange={(e) => {
                      const eventConfig = {
                        ...(selfHealingJobFormData.event_config || {}),
                        event_type: e.target.value
                      };
                      setSelfHealingJobFormData({
                        ...selfHealingJobFormData,
                        event_config: eventConfig
                      });
                    }}
                  >
                    <MenuItem value="device_online">Device Online</MenuItem>
                    <MenuItem value="device_offline">Device Offline</MenuItem>
                    <MenuItem value="alert_triggered">Alert Triggered</MenuItem>
                    <MenuItem value="profile_applied">Profile Applied</MenuItem>
                    <MenuItem value="system_startup">System Startup</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            {selfHealingJobFormData.job_type === 'monitoring-policy' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Monitoring Policy</InputLabel>
                  <Select
                    value={selfHealingJobFormData.monitoring_policy_id || ''}
                    label="Monitoring Policy"
                    onChange={(e) => {
                      setSelfHealingJobFormData({
                        ...selfHealingJobFormData,
                        monitoring_policy_id: e.target.value
                      });
                    }}
                  >
                    {monitoringPolicies.map(policy => (
                      <MenuItem key={policy.id} value={policy.id}>{policy.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={selfHealingJobFormData.description}
                onChange={handleSelfHealingJobFormChange}
                multiline
                rows={3}
              />
            </Grid>
            {selfHealingJobFormData.job_type !== 'monitoring-policy' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Detection Script</InputLabel>
                  <Select
                    name="detection_script_id"
                    value={selfHealingJobFormData.detection_script_id || ''}
                    label="Detection Script"
                    onChange={handleSelfHealingJobFormChange}
                    required
                  >
                    {detectionScripts.map(script => (
                        <MenuItem key={script.id} value={script.id}>{script.name}</MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>Scripts with detection purpose</FormHelperText>
                </FormControl>
              </Grid>
            )}
            {selfHealingJobFormData.job_type === 'monitoring-policy' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Detection Script (Optional)</InputLabel>
                  <Select
                    name="detection_script_id"
                    value={selfHealingJobFormData.detection_script_id || ''}
                    label="Detection Script (Optional)"
                    onChange={handleSelfHealingJobFormChange}
                  >
                    <MenuItem value="">None (Use monitoring policy failure as detection)</MenuItem>
                    {detectionScripts.map(script => (
                        <MenuItem key={script.id} value={script.id}>{script.name}</MenuItem>
                      ))}
                  </Select>
                  <FormHelperText>Optional: The monitoring policy failure itself will serve as detection</FormHelperText>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                {selfHealingJobFormData.job_type === 'monitoring-policy' 
                  ? "Remediation Steps for Monitoring Policy" 
                  : "Remediation Steps"}
              </Typography>
              {selfHealingJobFormData.job_type === 'monitoring-policy' && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  When the monitoring policy fails, the system will run these remediation steps on the target.
                </Typography>
              )}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                {selfHealingJobFormData.remediation_steps && selfHealingJobFormData.remediation_steps.length > 0 ? (
                  selfHealingJobFormData.remediation_steps.map((step, index) => (
                    <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, position: 'relative' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Step {index + 1}
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Remediation Script</InputLabel>
                            <Select
                              value={step.remediation_script_id || ''}
                              label="Remediation Script"
                              onChange={(e) => handleRemediationStepChange(index, 'remediation_script_id', e.target.value)}
                              required
                            >
                              {remediationScripts.map(script => (
                                <MenuItem key={script.id} value={script.id}>{script.name}</MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Scripts with remediation purpose</FormHelperText>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Verification Script</InputLabel>
                            <Select
                              value={step.verification_script_id || ''}
                              label="Verification Script"
                              onChange={(e) => handleRemediationStepChange(index, 'verification_script_id', e.target.value)}
                            >
                              <MenuItem value="">None</MenuItem>
                              {validationScripts.map(script => (
                                <MenuItem key={script.id} value={script.id}>{script.name}</MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Scripts with verification purpose</FormHelperText>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => handleMoveRemediationStep(index, 'up')}
                          disabled={index === 0}
                          sx={{ mr: 1 }}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleMoveRemediationStep(index, 'down')}
                          disabled={index === selfHealingJobFormData.remediation_steps.length - 1}
                          sx={{ mr: 1 }}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleRemoveRemediationStep(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No remediation steps added yet. Click "Add Step" to add a remediation step.
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<AddIcon />} 
                    onClick={handleAddRemediationStep}
                  >
                    Add Step
                  </Button>
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  name="severity"
                  value={selfHealingJobFormData.severity}
                  label="Severity"
                  onChange={handleSelfHealingJobFormChange}
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target Scope</InputLabel>
                <Select
                  name="target_scope"
                  value={selfHealingJobFormData.target_scope}
                  label="Target Scope"
                  onChange={handleSelfHealingJobFormChange}
                >
                  <MenuItem value="all">All Devices</MenuItem>
                  <MenuItem value="company">Company</MenuItem>
                  <MenuItem value="device">Specific Device</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Target</InputLabel>
                <Select
                  name="target_id"
                  value={selfHealingJobFormData.target_id}
                  label="Target"
                  onChange={handleSelfHealingJobFormChange}
                >
                  {selfHealingJobFormData.target_scope === 'company' && 
                    companies.map(company => (
                      <MenuItem key={company.id} value={company.id}>{company.CompanyName}</MenuItem>
                    ))
                  }
                  {selfHealingJobFormData.target_scope === 'device' && 
                    devices.map(device => (
                      <MenuItem key={device.id} value={device.id}>{device.name}</MenuItem>
                    ))
                  }
                  {selfHealingJobFormData.target_scope === 'tag' && 
                    tags.map(tag => (
                      <MenuItem key={tag.id} value={tag.id}>{tag.name}</MenuItem>
                    ))
                  }
                </Select>
                <FormHelperText>
                  {selfHealingJobFormData.target_scope === 'all' ? 
                    'No target selection needed for "All Devices"' : 
                    `Select a specific ${selfHealingJobFormData.target_scope}`}
                </FormHelperText>
              </FormControl>
            </Grid>
            {selfHealingJobFormData.job_type !== 'event-triggered' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Max Attempts"
                  name="max_attempts"
                  type="number"
                  value={selfHealingJobFormData.max_attempts}
                  onChange={handleSelfHealingJobFormChange}
                />
                <FormHelperText>
                  Maximum number of retry attempts (not applicable for event-triggered jobs)
                </FormHelperText>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cooldown (minutes)"
                name="cooldown_minutes"
                type="number"
                value={selfHealingJobFormData.cooldown_minutes}
                onChange={handleSelfHealingJobFormChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={selfHealingJobFormData.is_active}
                    onChange={handleSelfHealingJobFormChange}
                    name="is_active"
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSelfHealingJobDialogClose}>Cancel</Button>
          <Button 
            onClick={handleCreateSelfHealingJob}
            variant="contained"
            disabled={!selfHealingJobFormData.name || (selfHealingJobFormData.job_type !== 'monitoring-policy' && !selfHealingJobFormData.detection_script_id) || (!selfHealingJobFormData.remediation_script_id && (!selfHealingJobFormData.remediation_steps || selfHealingJobFormData.remediation_steps.length === 0))}
          >
            {selfHealingJobFormData.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
