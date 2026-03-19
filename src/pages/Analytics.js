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
  FormControlLabel,
  Switch,
  Tooltip,
  Breadcrumbs,
  Link,
  Tabs,
  Tab,
  Chip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Dashboard as DashboardIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Storage as StorageIcon,
  Schedule as ScheduleIcon,
  PlayArrow as PlayArrowIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dashboards, setDashboards] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedDashboard, setSelectedDashboard] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: false
  });
  const [isEditing, setIsEditing] = useState(false);
  const [accessError, setAccessError] = useState('');
  // Scheduled Reports state
  const [tabValue, setTabValue] = useState(0);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    name: '', description: '', schedule_type: 'daily', schedule_value: '09:00',
    export_format: 'csv', recipients: '', config: {}, is_active: true
  });
  const [editingReport, setEditingReport] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboards();
    fetchScheduledReports();
  }, []);

  const fetchDashboards = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/analytics/dashboards');
      setDashboards(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      if (error.response) {
        if (error.response.status === 402) {
          setAccessError('Subscription required.');
        } else if (error.response.status === 403) {
          setAccessError('Access Denied');
        }
      }
      setLoading(false);
    }
  };

  const handleMenuClick = (event, dashboard) => {
    setAnchorEl(event.currentTarget);
    setSelectedDashboard(dashboard);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateClick = () => {
    setFormData({
      name: '',
      description: '',
      is_public: false
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const handleEditClick = () => {
    setFormData({
      name: selectedDashboard.name,
      description: selectedDashboard.description || '',
      is_public: selectedDashboard.is_public
    });
    setIsEditing(true);
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleViewClick = () => {
    navigate(`/dashboard/analytics/dashboard/${selectedDashboard.id}`);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'is_public' ? checked : value
    });
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/analytics/dashboards/${selectedDashboard.id}`, formData);
      } else {
        await axios.post('/api/analytics/dashboards', formData);
      }
      fetchDashboards();
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving dashboard:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/analytics/dashboards/${selectedDashboard.id}`);
      fetchDashboards();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    }
  };

  const fetchScheduledReports = async () => {
    try {
      const response = await axios.get('/api/analytics/scheduled-reports');
      setScheduledReports(response.data);
    } catch (error) {
      console.error('Error fetching scheduled reports:', error);
    }
  };

  const handleCreateReport = () => {
    setReportFormData({
      name: '', description: '', schedule_type: 'daily', schedule_value: '09:00',
      export_format: 'csv', recipients: '', config: {}, is_active: true
    });
    setEditingReport(null);
    setOpenReportDialog(true);
  };

  const handleEditReport = (report) => {
    setReportFormData({
      name: report.name, description: report.description || '',
      schedule_type: report.schedule_type, schedule_value: report.schedule_value,
      export_format: report.export_format, recipients: Array.isArray(report.recipients) ? report.recipients.join(', ') : '',
      config: report.config || {}, is_active: report.is_active
    });
    setEditingReport(report);
    setOpenReportDialog(true);
  };

  const handleReportSubmit = async () => {
    try {
      const payload = {
        ...reportFormData,
        recipients: reportFormData.recipients.split(',').map(e => e.trim()).filter(Boolean)
      };
      if (editingReport) {
        await axios.put(`/api/analytics/scheduled-reports/${editingReport.id}`, payload);
      } else {
        await axios.post('/api/analytics/scheduled-reports', payload);
      }
      fetchScheduledReports();
      setOpenReportDialog(false);
    } catch (error) {
      console.error('Error saving scheduled report:', error);
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Delete this scheduled report?')) return;
    try {
      await axios.delete(`/api/analytics/scheduled-reports/${id}`);
      fetchScheduledReports();
    } catch (error) {
      console.error('Error deleting scheduled report:', error);
    }
  };

  const handleRunReport = async (id) => {
    try {
      await axios.post(`/api/analytics/scheduled-reports/${id}/run`);
      alert('Report executed successfully');
      fetchScheduledReports();
    } catch (error) {
      console.error('Error running report:', error);
      alert('Failed to run report');
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
            Analytics
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Typography color="text.primary">Analytics</Typography>
          </Breadcrumbs>
        </Box>
        <Box>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateClick}
          >
            Create Dashboard
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Dashboards" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="Scheduled Reports" icon={<ScheduleIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabValue === 0 && <>

      <Typography variant="body1" color="text.secondary" paragraph>
        Create and manage analytics dashboards with customizable widgets and data visualizations.
      </Typography>

      {dashboards.length === 0 ? (
        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No Dashboards Found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Get started by creating your first analytics dashboard.
            </Typography>
          </CardContent>
          <CardActions sx={{ justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
            >
              Create Dashboard
            </Button>
          </CardActions>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {dashboards.map((dashboard) => (
            <Grid item xs={12} sm={6} md={4} key={dashboard.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <DashboardIcon color="primary" sx={{ mr: 1 }} />
                      <Typography variant="h6" component="div" noWrap>
                        {dashboard.name}
                      </Typography>
                    </Box>
                    <IconButton 
                      aria-label="dashboard menu" 
                      onClick={(e) => handleMenuClick(e, dashboard)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 60, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {dashboard.description || 'No description provided.'}
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created by: {dashboard.creator_name || 'Unknown'}
                    </Typography>
                    {dashboard.is_public && (
                      <Tooltip title="Public dashboard">
                        <Typography variant="caption" color="primary">
                          Public
                        </Typography>
                      </Tooltip>
                    )}
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<ViewIcon />}
                    onClick={() => {
                      setSelectedDashboard(dashboard);
                      handleViewClick();
                    }}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setSelectedDashboard(dashboard);
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

      </>}

      {/* Scheduled Reports Tab */}
      {tabValue === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Automate report generation and delivery via email on a schedule.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateReport}>
              New Scheduled Report
            </Button>
          </Box>

          {scheduledReports.length === 0 ? (
            <Card sx={{ mt: 2, p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>No Scheduled Reports</Typography>
                <Typography variant="body2" color="text.secondary">
                  Create a scheduled report to automatically generate and email reports.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {scheduledReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" noWrap>{report.name}</Typography>
                        <Chip label={report.is_active ? 'Active' : 'Inactive'} size="small"
                              color={report.is_active ? 'success' : 'default'} />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, height: 40, overflow: 'hidden' }}>
                        {report.description || 'No description'}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" display="block">
                        <ScheduleIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {report.schedule_type}: {report.schedule_value}
                      </Typography>
                      <Typography variant="caption" display="block">
                        <EmailIcon sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                        {Array.isArray(report.recipients) ? report.recipients.length : 0} recipient(s)
                      </Typography>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Format: {report.export_format?.toUpperCase()} | Last run: {report.last_run_at ? new Date(report.last_run_at).toLocaleString() : 'Never'}
                      </Typography>
                    </CardContent>
                    <Divider />
                    <CardActions>
                      <Tooltip title="Run Now"><IconButton size="small" onClick={() => handleRunReport(report.id)}><PlayArrowIcon /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditReport(report)}><EditIcon /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteReport(report.id)}><DeleteIcon /></IconButton></Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}

      {/* Dashboard Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewClick}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View Dashboard
        </MenuItem>
        <MenuItem onClick={handleEditClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Dashboard
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Dashboard
        </MenuItem>
      </Menu>

      {/* Create/Edit Dashboard Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>{isEditing ? 'Edit Dashboard' : 'Create Dashboard'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Dashboard Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
          />
          <FormControlLabel
            control={
              <Switch
                checked={formData.is_public}
                onChange={handleInputChange}
                name="is_public"
              />
            }
            label="Public Dashboard"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Dashboard</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the dashboard "{selectedDashboard?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scheduled Report Dialog */}
      <Dialog open={openReportDialog} onClose={() => setOpenReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}</DialogTitle>
        <DialogContent>
          <TextField autoFocus margin="dense" label="Report Name" fullWidth variant="outlined"
                     value={reportFormData.name} onChange={(e) => setReportFormData({...reportFormData, name: e.target.value})} required />
          <TextField margin="dense" label="Description" fullWidth variant="outlined" multiline rows={2}
                     value={reportFormData.description} onChange={(e) => setReportFormData({...reportFormData, description: e.target.value})} />
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Schedule</InputLabel>
                <Select value={reportFormData.schedule_type} label="Schedule"
                        onChange={(e) => setReportFormData({...reportFormData, schedule_type: e.target.value})}>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField margin="dense" label="Schedule Value" fullWidth variant="outlined"
                         helperText={reportFormData.schedule_type === 'daily' ? 'e.g. 09:00' : reportFormData.schedule_type === 'weekly' ? 'e.g. monday 09:00' : 'e.g. 1 09:00'}
                         value={reportFormData.schedule_value} onChange={(e) => setReportFormData({...reportFormData, schedule_value: e.target.value})} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth margin="dense">
                <InputLabel>Format</InputLabel>
                <Select value={reportFormData.export_format} label="Format"
                        onChange={(e) => setReportFormData({...reportFormData, export_format: e.target.value})}>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="pdf">PDF</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Switch checked={reportFormData.is_active} onChange={(e) => setReportFormData({...reportFormData, is_active: e.target.checked})} />}
                label="Active" sx={{ mt: 2 }}
              />
            </Grid>
          </Grid>
          <TextField margin="dense" label="Recipients (comma-separated emails)" fullWidth variant="outlined"
                     value={reportFormData.recipients} onChange={(e) => setReportFormData({...reportFormData, recipients: e.target.value})}
                     helperText="Enter email addresses separated by commas" />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReportDialog(false)}>Cancel</Button>
          <Button onClick={handleReportSubmit} variant="contained" disabled={!reportFormData.name}>
            {editingReport ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
