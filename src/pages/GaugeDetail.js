import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Breadcrumbs,
  Link,
  Paper,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

// Import custom hooks
import useGaugeData from '../hooks/useGaugeData';

// Import custom components
import TabPanel from '../components/common/TabPanel';
import GaugeForm from '../components/gauges/GaugeForm';
import FieldsList from '../components/gauges/FieldsList';
import GaugePreview from '../components/gauges/GaugePreview';

export default function GaugeDetail({ isCreating = false }) {
  const { gaugeId } = useParams();
  const navigate = useNavigate();

  // Use custom hook for data fetching
  const {
    loading,
    gauge,
    datasources,
    integrations,
    integrationsLoading,
    integrationsError,
    datasets,
    categories,
    tags,
    folders,
    error,
    showNoIntegrationsAlert,
    fetchDatasets
  } = useGaugeData(gaugeId, isCreating);

  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    datasource_id: '',
    integration_id: '',
    dataset: '',
    gauge_type: 'number',
    category_id: '',
    config: {},
    drilldown_gauge_id: '',
    tag_ids: [],
    folder_ids: []
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [drilldownFields, setDrilldownFields] = useState([]);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [datasourceFields, setDatasourceFields] = useState([]);
  const [selectedFields, setSelectedFields] = useState({
    measures: [],
    dimensions: [],
    filters: []
  });
  const [layers, setLayers] = useState([
    { id: 1, name: 'Layer 1', measures: [], dimensions: [], filters: [] }
  ]);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [saving, setSaving] = useState(false);

  const availableIntegrations = useMemo(
    () =>
      isCreating
        ? integrations.filter(
            (i) =>
              !['openai', 'ms365', 'teamscommand'].includes(
                i.integration_type
              )
          )
        : integrations,
    [integrations, isCreating]
  );

  // Initialize form data from gauge when editing
  React.useEffect(() => {
    if (gauge && !isCreating) {
      setFormData({
        name: gauge.name || '',
        description: gauge.description || '',
        datasource_id: gauge.datasource_id || '',
        integration_id: gauge.integration_id || '',
        dataset: gauge.dataset || '',
        gauge_type: gauge.gauge_type || 'number',
        category_id: gauge.category_id || '',
        config: gauge.config || {},
        drilldown_gauge_id: gauge.config?.drilldown_gauge_id || '',
        tag_ids: gauge.tag_ids || [],
        folder_ids: gauge.folder_ids || []
      });

      if (gauge.config?.layers) {
        setLayers(gauge.config.layers);
      }
      if (gauge.config?.drilldown_fields) {
        setDrilldownFields(gauge.config.drilldown_fields);
      }

      // Set selected tags and folders
      if (gauge.tags) {
        setSelectedTags(gauge.tags);
      }
      if (gauge.folders) {
        setSelectedFolders(gauge.folders);
      }
    }
  }, [gauge, isCreating]);

  // Tab change handler
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Form field change handler
  const handleFormChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Tags change handler
  const handleTagsChange = (event, newValue) => {
    setSelectedTags(newValue);
    setFormData(prev => ({
      ...prev,
      tag_ids: newValue.map(tag => tag.id)
    }));
  };

  // Folders change handler
  const handleFoldersChange = (event, newValue) => {
    setSelectedFolders(newValue);
    setFormData(prev => ({
      ...prev,
      folder_ids: newValue.map(folder => folder.id)
    }));
  };

  const handleDrilldownFieldsChange = (event, newValue) => {
    setDrilldownFields(newValue);
  };

  // Preview handler
  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewError(null);

      // Generate mock preview data based on gauge type
      let mockData;
      switch (formData.gauge_type) {
        case 'number':
          mockData = {
            value: Math.floor(Math.random() * 1000),
            label: 'Total Count',
            trend: Math.random() > 0.5 ? 'up' : 'down',
            trendValue: Math.floor(Math.random() * 20)
          };
          break;
        case 'pie':
          mockData = {
            title: 'Distribution',
            data: [
              { name: 'Category A', value: Math.floor(Math.random() * 100) },
              { name: 'Category B', value: Math.floor(Math.random() * 100) },
              { name: 'Category C', value: Math.floor(Math.random() * 100) },
              { name: 'Category D', value: Math.floor(Math.random() * 100) }
            ]
          };
          break;
        case 'bar':
        case 'line':
          mockData = {
            title: formData.gauge_type === 'bar' ? 'Bar Chart' : 'Trend Over Time',
            xAxisLabel: formData.gauge_type === 'bar' ? 'Category' : 'Time',
            yAxisLabel: 'Value',
            data: Array.from({ length: 6 }, (_, i) => ({
              name: formData.gauge_type === 'bar' ? `Category ${String.fromCharCode(65 + i)}` : `Day ${i + 1}`,
              value: Math.floor(Math.random() * 100)
            }))
          };
          break;
        default:
          mockData = null;
      }

      if (formData.integration_id && formData.dataset) {
        try {
          const fieldsResponse = await axios.get(`/api/analytics/integrations/${formData.integration_id}/datasets/${formData.dataset}/fields`);
          setDatasourceFields(fieldsResponse.data);
        } catch (fieldError) {
          console.error("Error fetching fields:", fieldError);
          setPreviewError("Failed to load fields from data source.");
        }
      } else {
        setDatasourceFields([]);
      }
      setPreviewData(mockData);
      setPreviewLoading(false);
    } catch (error) {
      console.error('Error generating preview:', error);
      setPreviewError('Failed to generate preview. Please try again.');
      setPreviewLoading(false);
    }
  };

  // Save handler
const handleSave = async () => {
  try {
    setSaving(true);

    // Validate form
    if (!formData.name) {
      setSnackbar({
        open: true,
        message: 'Please enter a name for the gauge',
        severity: 'error'
      });
      setSaving(false);
      return;
    }

    // Create a copy of the form data to send to the server
    const dataToSubmit = { ...formData };
    dataToSubmit.config = {
      ...formData.config,
      layers,
      drilldown_fields: drilldownFields,
      drilldown_gauge_id: formData.drilldown_gauge_id || null
    };
    delete dataToSubmit.drilldown_gauge_id;

    // Set datasource_id to a combination of integration_id and dataset
    dataToSubmit.datasource_id = `${formData.integration_id}_${formData.dataset}`;

    if (isCreating) {
      await axios.post('/api/analytics/gauges', dataToSubmit);
      setSnackbar({
        open: true,
        message: 'Gauge created successfully',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/dashboard/analytics/gauges');
      }, 1500);
    } else {
      await axios.put(`/api/analytics/gauges/${gaugeId}`, dataToSubmit);
      setSnackbar({
        open: true,
        message: 'Gauge updated successfully',
        severity: 'success'
      });
    }

    setSaving(false);
  } catch (error) {
    console.error('Error saving gauge:', error);
    setSaving(false);
    setSnackbar({
      open: true,
      message: 'Error saving gauge',
      severity: 'error'
    });
  }
};


  // Field selection handlers
  const handleAddLayer = () => {
    const newLayer = {
      id: layers.length + 1,
      name: `Layer ${layers.length + 1}`,
      measures: [],
      dimensions: [],
      filters: []
    };
    setLayers([...layers, newLayer]);
    setCurrentLayer(layers.length);
  };

  const handleLayerChange = (e) => {
    setCurrentLayer(e.target.value);
  };

  const handleAddField = (field, targetType) => {
    const updatedLayers = [...layers];
    const currentLayerObj = updatedLayers[currentLayer];

    if (targetType === 'measure' && field.type === 'measure') {
      currentLayerObj.measures.push(field);
    } else if (targetType === 'dimension') {
      currentLayerObj.dimensions.push(field);
    } else if (targetType === 'filter') {
      currentLayerObj.filters.push({ ...field, operator: '=', value: '' });
    }

    setLayers(updatedLayers);
  };

  const handleRemoveField = (fieldName, targetType) => {
    const updatedLayers = [...layers];
    const currentLayerObj = updatedLayers[currentLayer];

    if (targetType === 'measure') {
      currentLayerObj.measures = currentLayerObj.measures.filter(f => f.name !== fieldName);
    } else if (targetType === 'dimension') {
      currentLayerObj.dimensions = currentLayerObj.dimensions.filter(f => f.name !== fieldName);
    } else if (targetType === 'filter') {
      currentLayerObj.filters = currentLayerObj.filters.filter(f => f.name !== fieldName);
    }

    setLayers(updatedLayers);
  };

  // Navigation handlers
  const handleBackClick = () => {
    navigate('/dashboard/analytics/gauges');
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          variant="contained" 
          onClick={handleBackClick} 
          startIcon={<ArrowBackIcon />}
          sx={{ mt: 2 }}
        >
          Back to Gauges
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          Dashboard
        </Link>
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/dashboard/analytics/gauges');
          }}
        >
          Gauges
        </Link>
        <Typography color="text.primary">
          {isCreating ? 'Create Gauge' : gauge?.name || 'Edit Gauge'}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">
          {isCreating ? 'Create New Gauge' : `Edit Gauge: ${gauge?.name || ''}`}
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={handleBackClick} 
            startIcon={<ArrowBackIcon />}
            sx={{ mr: 1 }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={saving}
            startIcon={saving && <CircularProgress size={20} />}
          >
            {saving ? 'Saving...' : 'Save Gauge'}
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="General" />
            <Tab label="Data" />
            <Tab label="Preview" />
          </Tabs>
        </Box>

        {/* General Tab */}
        <TabPanel value={tabValue} index={0}>
          <GaugeForm
            formData={formData}
            onChange={handleFormChange}
            datasources={datasources}
            integrations={availableIntegrations}
            datasets={datasets}
            categories={categories}
            tags={tags}
            folders={folders}
            integrationsLoading={integrationsLoading}
            integrationsError={integrationsError}
            showNoIntegrationsAlert={showNoIntegrationsAlert}
            onFetchDatasets={fetchDatasets}
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            selectedFolders={selectedFolders}
            onFoldersChange={handleFoldersChange}
            datasourceFields={datasourceFields}
            drilldownFields={drilldownFields}
            onDrilldownFieldsChange={handleDrilldownFieldsChange}
          />
        </TabPanel>

        {/* Data Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FormControl size="small" sx={{ mr: 2 }}>
              <InputLabel>Layer</InputLabel>
              <Select value={currentLayer} label="Layer" onChange={handleLayerChange}>
                {layers.map((layer, idx) => (
                  <MenuItem key={layer.id} value={idx}>{layer.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button size="small" variant="outlined" onClick={handleAddLayer}>Add Layer</Button>
          </Box>
          <Grid container spacing={3}>
            {/* Fields List */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Available Fields
              </Typography>
              <FieldsList
                fields={datasourceFields}
                loading={previewLoading}
                onAddField={handleAddField}
                onRefresh={handlePreview}
              />
            </Grid>

            {/* Selected Fields */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Selected Fields
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, minHeight: 400 }}>
                {layers[currentLayer].measures.length === 0 &&
                 layers[currentLayer].dimensions.length === 0 &&
                 layers[currentLayer].filters.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: 300
                  }}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No fields selected yet. Add fields from the list on the left.
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Measures */}
                    {layers[currentLayer].measures.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Measures
                        </Typography>
                        {layers[currentLayer].measures.map((field) => (
                          <Chip 
                            key={field.name}
                            label={field.name}
                            color="primary"
                            sx={{ mr: 1, mb: 1 }}
                            onDelete={() => handleRemoveField(field.name, 'measure')}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Dimensions */}
                    {layers[currentLayer].dimensions.length > 0 && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Dimensions
                        </Typography>
                        {layers[currentLayer].dimensions.map((field) => (
                          <Chip 
                            key={field.name}
                            label={field.name}
                            color="secondary"
                            sx={{ mr: 1, mb: 1 }}
                            onDelete={() => handleRemoveField(field.name, 'dimension')}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Filters */}
                    {layers[currentLayer].filters.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom>
                          Filters
                        </Typography>
                        {layers[currentLayer].filters.map((field) => (
                          <Chip 
                            key={field.name}
                            label={`${field.name} ${field.operator} ${field.value || '?'}`}
                            variant="outlined"
                            sx={{ mr: 1, mb: 1 }}
                            onDelete={() => handleRemoveField(field.name, 'filter')}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Preview Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Button 
              variant="contained" 
              onClick={handlePreview}
              startIcon={<RefreshIcon />}
              disabled={previewLoading}
            >
              {previewLoading ? 'Generating...' : 'Generate Preview'}
            </Button>
          </Box>

          <GaugePreview
            gaugeType={formData.gauge_type}
            previewData={previewData}
            loading={previewLoading}
            error={previewError}
            onRefresh={handlePreview}
          />
        </TabPanel>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
