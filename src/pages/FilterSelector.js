import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Divider,
  Grid,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterListIcon } from '@mui/icons-material';
import { getAvailableFilters, renderFilterInput, fetchFilterOptions } from './integration_filters';

/**
 * FilterSelector component
 * 
 * This component provides an "Add Filter" button that opens a dialog to select and add filters
 * from a predefined list based on the selected integration and dataset.
 * 
 * @param {Object} props - Component props
 * @param {string} props.integrationType - The type of integration (e.g., 'Autotask', 'Autotask PSA')
 * @param {string} props.datasetName - The name of the dataset (e.g., 'Tickets', 'Ticketing')
 * @param {Object} props.currentFilters - The current filters object
 * @param {Function} props.onAddFilter - Callback function when a filter is added
 * @param {Function} props.onRemoveFilter - Callback function when a filter is removed
 * @param {Function} props.onFilterChange - Callback function when a filter value is changed
 */
const FilterSelector = ({
  integrationType,
  datasetName,
  currentFilters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [availableFilters, setAvailableFilters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('');
  const [appliedFilters, setAppliedFilters] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch dynamic filter options when component mounts
  useEffect(() => {
    const loadDynamicOptions = async () => {
      if (integrationType && integrationType.toLowerCase().includes('autotask') && 
          datasetName && datasetName.toLowerCase() === 'tickets') {
        setLoading(true);
        try {
          await fetchFilterOptions();
          // After fetching options, get the filters again to include the updated options
          const updatedFilters = getAvailableFilters(integrationType, datasetName);
          setAvailableFilters(updatedFilters);
        } catch (error) {
          console.error('Error loading dynamic options:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDynamicOptions();
  }, [integrationType, datasetName]);

  // Get available filters when integration type or dataset name changes
  useEffect(() => {
    // Always get filters, even if integrationType or datasetName is missing
    // The getAvailableFilters function will handle missing values and return default filters
    const filters = getAvailableFilters(integrationType, datasetName);
    setAvailableFilters(filters);
  }, [integrationType, datasetName]);

  // Update applied filters when current filters change
  useEffect(() => {
    const filterIds = Object.keys(currentFilters || {});
    setAppliedFilters(filterIds);
  }, [currentFilters]);

  // Get available filters that haven't been applied yet
  const getUnappliedFilters = () => {
    // Filter out already applied filters
    const unappliedFilters = availableFilters.filter(filter => !appliedFilters.includes(filter.id));

    // If there are no unapplied filters but we have some available filters,
    // return a special "reset" filter that allows removing all filters and starting over
    if (unappliedFilters.length === 0 && availableFilters.length > 0) {
      return [{
        id: 'reset_filters',
        label: 'Reset Filters',
        type: 'special',
        description: 'Remove all filters and start over'
      }];
    }

    return unappliedFilters;
  };

  // Handle opening the dialog
  const handleOpenDialog = () => {
    setDialogOpen(true);
    setSelectedFilter('');
  };

  // Handle closing the dialog
  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // Handle adding a filter
  const handleAddFilter = () => {
    if (selectedFilter) {
      // Check if this is the special reset filter
      if (selectedFilter === 'reset_filters') {
        // Remove all filters by calling onRemoveFilter for each applied filter
        appliedFilters.forEach(filterId => {
          onRemoveFilter(filterId);
        });
        setDialogOpen(false);
        return;
      }

      // Normal filter handling
      const filter = availableFilters.find(f => f.id === selectedFilter);
      if (filter) {
        onAddFilter(filter.id, null); // Add the filter with a null value
        setDialogOpen(false);
      }
    }
  };

  // Handle removing a filter
  const handleRemoveFilter = (filterId) => {
    onRemoveFilter(filterId);
  };

  // Render the filter chips
  const renderFilterChips = () => {
    return appliedFilters.map(filterId => {
      const filter = availableFilters.find(f => f.id === filterId);
      if (!filter) return null;

      return (
        <Grid item key={filterId}>
          <Chip
            label={filter.label}
            onDelete={() => handleRemoveFilter(filterId)}
            color="primary"
            variant="outlined"
          />
        </Grid>
      );
    });
  };

  // Render the filter inputs
  const renderFilterInputs = () => {
    return appliedFilters.map(filterId => {
      const filter = availableFilters.find(f => f.id === filterId);
      if (!filter) return null;

      return (
        <Grid item xs={12} md={6} key={filterId}>
          {renderFilterInput(filter, currentFilters[filterId], onFilterChange)}
        </Grid>
      );
    });
  };

  return (
    <Box>
      {/* Applied Filters Section */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1">Applied Filters</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2">Loading filter options...</Typography>
            </Box>
          ) : (
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenDialog}
              disabled={getUnappliedFilters().length === 0}
            >
              Add Filter
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : appliedFilters.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No filters applied. Click "Add Filter" to add filters.
          </Typography>
        ) : (
          <>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {renderFilterChips()}
            </Grid>
            <Grid container spacing={2}>
              {renderFilterInputs()}
            </Grid>
          </>
        )}
      </Box>

      {/* Add Filter Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Add Filter</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="filter-select-label">Select Filter</InputLabel>
            <Select
              labelId="filter-select-label"
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              label="Select Filter"
            >
              {getUnappliedFilters().map((filter) => (
                <MenuItem key={filter.id} value={filter.id}>
                  {filter.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleAddFilter} 
            variant="contained" 
            color="primary"
            disabled={!selectedFilter}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FilterSelector;
