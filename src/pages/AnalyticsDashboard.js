import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
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
  Paper,
  Tooltip,
  FormHelperText,
  Slider,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Import chart components for rendering widgets
import NumberCard from '../components/charts/NumberCard';
import PieChart from '../components/charts/PieChart';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import AreaChart from '../components/charts/AreaChart';
import StackedBarChart from '../components/charts/StackedBarChart';
import DonutChart from '../components/charts/DonutChart';
import ScatterChart from '../components/charts/ScatterChart';
import DataTable from '../components/charts/DataTable';
import KpiTrendCard from '../components/charts/KpiTrendCard';
import { ExportMenu, AutoRefresh } from '../components/analytics';

export default function AnalyticsDashboard() {
  const { dashboardId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [widgets, setWidgets] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [openWidgetDialog, setOpenWidgetDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [widgetFormData, setWidgetFormData] = useState({
    name: '',
    description: '',
    datasource_id: '',
    widget_type: 'number_card',
    position_x: 0,
    position_y: 0,
    width: 4,
    height: 4,
    config: {}
  });
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
    fetchDatasources();
  }, [dashboardId]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/analytics/dashboards/${dashboardId}`);
      setDashboard(response.data);
      setWidgets(response.data.widgets || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      setLoading(false);
    }
  };

  const fetchDatasources = async () => {
    try {
      const response = await axios.get('/api/analytics/datasources');
      setDatasources(response.data);
    } catch (error) {
      console.error('Error fetching datasources:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuClick = (event, widget) => {
    setAnchorEl(event.currentTarget);
    setSelectedWidget(widget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddWidgetClick = () => {
    setWidgetFormData({
      name: '',
      description: '',
      datasource_id: datasources.length > 0 ? datasources[0].id : '',
      widget_type: 'number_card',
      position_x: 0,
      position_y: 0,
      width: 4,
      height: 4,
      config: {}
    });
    setIsEditing(false);
    setOpenWidgetDialog(true);
  };

  const handleEditWidgetClick = () => {
    setWidgetFormData({
      name: selectedWidget.name,
      description: selectedWidget.description || '',
      datasource_id: selectedWidget.datasource_id,
      widget_type: selectedWidget.widget_type,
      position_x: selectedWidget.position_x,
      position_y: selectedWidget.position_y,
      width: selectedWidget.width,
      height: selectedWidget.height,
      config: selectedWidget.config || {}
    });
    setIsEditing(true);
    setOpenWidgetDialog(true);
    handleMenuClose();
  };

  const handleDeleteWidgetClick = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const handleWidgetDialogClose = () => {
    setOpenWidgetDialog(false);
  };

  const handleDeleteDialogClose = () => {
    setOpenDeleteDialog(false);
  };

  const handleWidgetInputChange = (e) => {
    const { name, value } = e.target;
    setWidgetFormData({
      ...widgetFormData,
      [name]: value
    });
  };

  const handleWidgetSubmit = async () => {
    try {
      if (isEditing) {
        await axios.put(`/api/analytics/widgets/${selectedWidget.id}`, widgetFormData);
      } else {
        await axios.post('/api/analytics/widgets', {
          ...widgetFormData,
          dashboard_id: dashboardId
        });
      }
      fetchDashboard();
      setOpenWidgetDialog(false);
    } catch (error) {
      console.error('Error saving widget:', error);
    }
  };

  const handleDeleteWidget = async () => {
    try {
      await axios.delete(`/api/analytics/widgets/${selectedWidget.id}`);
      fetchDashboard();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting widget:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard/analytics');
  };

  const renderWidget = (widget) => {
    switch (widget.widget_type) {
      case 'number_card':
        return (
          <NumberCard
            value={widget.config?.value || 0}
            label={widget.name}
            trend={widget.config?.trend}
            trendValue={widget.config?.trendValue}
          />
        );
      case 'pie_chart':
        return (
          <PieChart
            title={widget.name}
            data={widget.config?.data || []}
          />
        );
      case 'line_chart':
        return (
          <LineChart
            title={widget.name}
            data={widget.config?.data || []}
            xAxisLabel={widget.config?.xAxisLabel || 'Time'}
            yAxisLabel={widget.config?.yAxisLabel || 'Value'}
          />
        );
      case 'bar_chart':
        return (
          <BarChart
            title={widget.name}
            data={widget.config?.data || []}
            xAxisLabel={widget.config?.xAxisLabel || 'Category'}
            yAxisLabel={widget.config?.yAxisLabel || 'Value'}
          />
        );
      case 'area_chart':
        return (
          <AreaChart
            title={widget.name}
            data={widget.config?.data || []}
            xAxisLabel={widget.config?.xAxisLabel || 'Time'}
            yAxisLabel={widget.config?.yAxisLabel || 'Value'}
            dataKeys={widget.config?.dataKeys}
            stacked={widget.config?.stacked}
          />
        );
      case 'stacked_bar_chart':
        return (
          <StackedBarChart
            title={widget.name}
            data={widget.config?.data || []}
            xAxisLabel={widget.config?.xAxisLabel || 'Category'}
            yAxisLabel={widget.config?.yAxisLabel || 'Value'}
            dataKeys={widget.config?.dataKeys}
            horizontal={widget.config?.horizontal}
          />
        );
      case 'donut_chart':
        return (
          <DonutChart
            title={widget.name}
            data={widget.config?.data || []}
            nameKey={widget.config?.nameKey || 'name'}
            valueKey={widget.config?.valueKey || 'value'}
          />
        );
      case 'scatter_chart':
        return (
          <ScatterChart
            title={widget.name}
            data={widget.config?.data || []}
            xAxisLabel={widget.config?.xAxisLabel}
            yAxisLabel={widget.config?.yAxisLabel}
            xKey={widget.config?.xKey || 'x'}
            yKey={widget.config?.yKey || 'y'}
          />
        );
      case 'data_table':
        return (
          <DataTable
            title={widget.name}
            data={widget.config?.data || []}
            columns={widget.config?.columns}
          />
        );
      case 'kpi_trend':
        return (
          <KpiTrendCard
            title={widget.name}
            currentValue={widget.config?.currentValue}
            previousValue={widget.config?.previousValue}
            changePercent={widget.config?.changePercent}
            trend={widget.config?.trend}
            format={widget.config?.format}
            suffix={widget.config?.suffix}
          />
        );
      default:
        return (
          <NumberCard
            value={widget.config?.value || 0}
            label={widget.name}
          />
        );
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" color="error">
          Dashboard not found
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />} 
          onClick={handleBackClick}
          sx={{ mt: 2 }}
        >
          Back to Analytics
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            {dashboard.name}
          </Typography>
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/dashboard">
              Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/analytics">
              Analytics
            </Link>
            <Typography color="text.primary">{dashboard.name}</Typography>
          </Breadcrumbs>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoRefresh onRefresh={fetchDashboard} compact />
          <ExportMenu
            onExportCsv={() => {
              const allData = widgets.flatMap(w => w.config?.data || []);
              if (allData.length === 0) return;
              const cols = Object.keys(allData[0]);
              const csv = [cols.join(','), ...allData.map(r => cols.map(c => JSON.stringify(r[c] ?? '')).join(','))].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `${dashboard.name || 'dashboard'}.csv`; a.click();
            }}
            onExportPdf={async () => {
              try {
                const response = await axios.post('/api/analytics/export/pdf', {
                  integration_id: widgets[0]?.config?.integration_id,
                  dataset_id: widgets[0]?.config?.dataset_id,
                  title: dashboard.name,
                }, { responseType: 'blob' });
                const url = URL.createObjectURL(response.data);
                const a = document.createElement('a'); a.href = url; a.download = `${dashboard.name || 'dashboard'}.pdf`; a.click();
              } catch (err) { console.error('PDF export failed:', err); }
            }}
            disabled={widgets.length === 0}
          />
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackClick}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddWidgetClick}
          >
            Add Widget
          </Button>
        </Box>
      </Box>

      {dashboard.description && (
        <Typography variant="body1" color="text.secondary" paragraph>
          {dashboard.description}
        </Typography>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="dashboard tabs">
          <Tab label="Dashboard" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="Settings" icon={<SettingsIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {tabValue === 0 ? (
        widgets.length === 0 ? (
          <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                No Widgets Found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Get started by adding widgets to your dashboard.
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<AddIcon />}
                onClick={handleAddWidgetClick}
                sx={{ mt: 2 }}
              >
                Add Widget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {widgets.map((widget) => (
              <Grid 
                item 
                xs={12} 
                sm={widget.width <= 6 ? 6 : 12} 
                md={widget.width <= 4 ? 4 : (widget.width <= 8 ? 8 : 12)} 
                key={widget.id}
              >
                <Box sx={{ position: 'relative' }}>
                  {renderWidget(widget)}
                  <IconButton
                    aria-label="widget menu"
                    onClick={(e) => handleMenuClick(e, widget)}
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Dashboard Settings
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure dashboard settings and layout options.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>
            Dashboard Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Name:</strong> {dashboard.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Created By:</strong> {dashboard.creator_name || 'Unknown'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Created:</strong> {new Date(dashboard.created_at).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Last Updated:</strong> {new Date(dashboard.updated_at).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2">
                <strong>Description:</strong> {dashboard.description || 'No description provided.'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Widget Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditWidgetClick}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit Widget
        </MenuItem>
        <MenuItem onClick={handleDeleteWidgetClick}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Widget
        </MenuItem>
      </Menu>

      {/* Add/Edit Widget Dialog */}
      <Dialog 
        open={openWidgetDialog} 
        onClose={handleWidgetDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{isEditing ? 'Edit Widget' : 'Add Widget'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                autoFocus
                name="name"
                label="Widget Name"
                type="text"
                fullWidth
                variant="outlined"
                value={widgetFormData.name}
                onChange={handleWidgetInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="widget-type-label">Widget Type</InputLabel>
                <Select
                  labelId="widget-type-label"
                  id="widget-type"
                  name="widget_type"
                  value={widgetFormData.widget_type}
                  label="Widget Type"
                  onChange={handleWidgetInputChange}
                >
                  <MenuItem value="number_card">Number Card</MenuItem>
                  <MenuItem value="kpi_trend">KPI Trend Card</MenuItem>
                  <MenuItem value="pie_chart">Pie Chart</MenuItem>
                  <MenuItem value="donut_chart">Donut Chart</MenuItem>
                  <MenuItem value="line_chart">Line Chart</MenuItem>
                  <MenuItem value="area_chart">Area Chart</MenuItem>
                  <MenuItem value="bar_chart">Bar Chart</MenuItem>
                  <MenuItem value="stacked_bar_chart">Stacked Bar Chart</MenuItem>
                  <MenuItem value="scatter_chart">Scatter Chart</MenuItem>
                  <MenuItem value="data_table">Data Table</MenuItem>
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
                value={widgetFormData.description}
                onChange={handleWidgetInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="datasource-label">Data Source</InputLabel>
                <Select
                  labelId="datasource-label"
                  id="datasource"
                  name="datasource_id"
                  value={widgetFormData.datasource_id}
                  label="Data Source"
                  onChange={handleWidgetInputChange}
                >
                  {datasources.map((ds) => (
                    <MenuItem key={ds.id} value={ds.id}>{ds.name}</MenuItem>
                  ))}
                </Select>
                {datasources.length === 0 && (
                  <FormHelperText error>
                    No data sources available. Data sources are your connected integrations. Please <Link href="/dashboard/settings/integrations" target="_blank">set up an integration</Link> first.
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Width</Typography>
              <Slider
                name="width"
                value={widgetFormData.width}
                onChange={(e, newValue) => 
                  setWidgetFormData({...widgetFormData, width: newValue})
                }
                step={1}
                marks
                min={1}
                max={12}
                valueLabelDisplay="auto"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography gutterBottom>Height</Typography>
              <Slider
                name="height"
                value={widgetFormData.height}
                onChange={(e, newValue) => 
                  setWidgetFormData({...widgetFormData, height: newValue})
                }
                step={1}
                marks
                min={1}
                max={12}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWidgetDialogClose}>Cancel</Button>
          <Button 
            onClick={handleWidgetSubmit} 
            variant="contained"
            disabled={!widgetFormData.name || !widgetFormData.datasource_id}
          >
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Widget</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the widget "{selectedWidget?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteWidget} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
