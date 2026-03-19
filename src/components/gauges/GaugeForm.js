import React from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  Chip,
  Alert,
  CircularProgress,
  Typography
} from '@mui/material';

/**
 * Component for gauge creation/editing form
 */
function GaugeForm({
  formData,
  onChange,
  datasources,
  integrations,
  datasets,
  categories,
  tags,
  folders,
  integrationsLoading,
  integrationsError,
  showNoIntegrationsAlert,
  onFetchDatasets,
  selectedTags,
  onTagsChange,
  selectedFolders,
  onFoldersChange,
  datasourceFields = [],
  drilldownFields = [],
  onDrilldownFieldsChange
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  const handleIntegrationChange = (e) => {
    const integrationId = e.target.value;
    onChange('integration_id', integrationId);

    // Reset dataset selection
    onChange('dataset', '');

    // Fetch datasets for the selected integration
    if (integrationId) {
      onFetchDatasets(integrationId);
    }
  };

  return (
    <Box>
      <Grid container spacing={2}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Gauge Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            margin="normal"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            margin="normal"
          />
        </Grid>

        {/* Data Source Selection */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Integration</InputLabel>
            <Select
              name="integration_id"
              value={formData.integration_id}
              onChange={handleIntegrationChange}
              label="Integration"
              disabled={integrationsLoading}
            >
              <MenuItem value="">
                <em>Select an integration</em>
              </MenuItem>
              {integrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {integration.name || integration.integration_type}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Select the integration to use as data source
            </FormHelperText>
          </FormControl>

          {integrationsLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">Loading integrations...</Typography>
            </Box>
          )}

          {integrationsError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {integrationsError}
            </Alert>
          )}

          {showNoIntegrationsAlert && (
            <Alert severity="warning" sx={{ mt: 1 }}>
              No integrations found. Please set up an integration first.
            </Alert>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Dataset</InputLabel>
            <Select
              name="dataset"
              value={formData.dataset}
              onChange={handleChange}
              label="Dataset"
              disabled={!formData.integration_id}
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
            <FormHelperText>
              Select the dataset to visualize
            </FormHelperText>
          </FormControl>
        </Grid>

        {/* Gauge Type and Category */}
        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Gauge Type</InputLabel>
            <Select
              name="gauge_type"
              value={formData.gauge_type}
              onChange={handleChange}
              label="Gauge Type"
            >
              <MenuItem value="number">Number</MenuItem>
              <MenuItem value="pie">Pie Chart</MenuItem>
              <MenuItem value="bar">Bar Chart</MenuItem>
              <MenuItem value="line">Line Chart</MenuItem>
            </Select>
            <FormHelperText>
              Select the type of visualization
            </FormHelperText>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              label="Category"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              Categorize this gauge (optional)
            </FormHelperText>
          </FormControl>
        </Grid>

<Grid item xs={12} md={6}>
  <Autocomplete
    multiple
    options={datasourceFields}
    getOptionLabel={(option) => option.name}
    value={drilldownFields}
    onChange={onDrilldownFieldsChange}
    renderTags={(value, getTagProps) =>
      value.map((option, index) => (
        <Chip
          label={option.name}
          {...getTagProps({ index })}
          key={option.name}
        />
      ))
    }
    renderInput={(params) => (
      <TextField
        {...params}
        label="Drilldown Fields"
        placeholder="Choose fields"
        margin="normal"
      />
    )}
  />
  <TextField
    fullWidth
    label="Drilldown Gauge ID"
    name="drilldown_gauge_id"
    type="number"
    value={formData.drilldown_gauge_id || ''}
    onChange={handleChange}
    margin="normal"
    helperText="Gauge ID to open when this gauge is clicked"
  />
</Grid>


        {/* Tags and Folders */}
        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={tags}
            getOptionLabel={(option) => option.name}
            value={selectedTags}
            onChange={onTagsChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Tags"
                placeholder="Add tags"
                margin="normal"
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Autocomplete
            multiple
            options={folders}
            getOptionLabel={(option) => option.name}
            value={selectedFolders}
            onChange={onFoldersChange}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.name}
                  {...getTagProps({ index })}
                  key={option.id}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Folders"
                placeholder="Add to folders"
                margin="normal"
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default GaugeForm;
