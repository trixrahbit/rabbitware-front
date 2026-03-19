// This file contains predefined filters for different integrations
// Each integration has a set of available filters that can be added to an alert

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress
} from '@mui/material';

// Filter types
export const FILTER_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  SELECT: 'select',
  BOOLEAN: 'boolean'
};

// Dynamic filter options that will be populated from the API
let dynamicFilterOptions = {
  status: [],
  priority: [],
  ticketType: []
};

// Function to fetch filter options from the API
export const fetchFilterOptions = async () => {
  try {
    const response = await axios.get('/api/integrations/autotask/ticket-picklists');

    // Map the API response to the format expected by the filters
    if (response.data) {
      // Map status options
      if (response.data.status && Array.isArray(response.data.status)) {
        dynamicFilterOptions.status = response.data.status.map(item => ({
          value: item.value,
          label: item.label
        }));
      }

      // Map priority options
      if (response.data.priority && Array.isArray(response.data.priority)) {
        dynamicFilterOptions.priority = response.data.priority.map(item => ({
          value: item.value,
          label: item.label
        }));
      }

      // Map ticketType options
      if (response.data.ticketType && Array.isArray(response.data.ticketType)) {
        dynamicFilterOptions.ticketType = response.data.ticketType.map(item => ({
          value: item.value,
          label: item.label
        }));
      }
    }

    return dynamicFilterOptions;
  } catch (error) {
    console.error('Error fetching filter options:', error);
    // Return the current dynamicFilterOptions even if there's an error
    // This ensures we still have the fallback options
    return dynamicFilterOptions;
  }
};

// Don't fetch options when the module loads - only fetch when explicitly requested
// This prevents API calls before login
// fetchFilterOptions().catch(error => {
//   console.error('Failed to fetch initial filter options:', error);
// });

// Autotask integration filters
const autotaskFilters = {
  // Tickets dataset filters
  Tickets: [
    {
      id: 'status',
      label: 'Status',
      type: FILTER_TYPES.SELECT,
      // Empty array as placeholder, will be populated by getLatestOptions
      options: [],
      description: 'Filter by ticket status',
      dynamicOptions: true
    },
    {
      id: 'priority',
      label: 'Priority',
      type: FILTER_TYPES.SELECT,
      // Empty array as placeholder, will be populated by getLatestOptions
      options: [],
      description: 'Filter by ticket priority',
      dynamicOptions: true
    },
    {
      id: 'ticketType',
      label: 'Ticket Type',
      type: FILTER_TYPES.SELECT,
      // Empty array as placeholder, will be populated by getLatestOptions
      options: [],
      description: 'Filter by ticket type',
      dynamicOptions: true
    },
    {
      id: 'dueDateTime',
      label: 'Due Date',
      type: FILTER_TYPES.DATE,
      description: 'Filter by due date'
    },
    {
      id: 'title',
      label: 'Title',
      type: FILTER_TYPES.TEXT,
      description: 'Filter by ticket title'
    },
    {
      id: 'description',
      label: 'Description',
      type: FILTER_TYPES.TEXT,
      description: 'Filter by ticket description'
    },
    // SLA threshold filters
    {
      id: 'responseTimeThreshold',
      label: 'Response Time Threshold (hours)',
      type: FILTER_TYPES.NUMBER,
      min: 0,
      step: 0.5,
      description: 'Filter by response time threshold in hours'
    },
    {
      id: 'resolutionTimeThreshold',
      label: 'Resolution Time Threshold (hours)',
      type: FILTER_TYPES.NUMBER,
      min: 0,
      step: 0.5,
      description: 'Filter by resolution time threshold in hours'
    },
    {
      id: 'slaPercentage',
      label: 'SLA Percentage',
      type: FILTER_TYPES.NUMBER,
      min: 0,
      max: 100,
      step: 1,
      description: 'Filter by SLA percentage'
    }
  ],
  // Add more datasets as needed
};

// Define filters for other integrations
const otherIntegrationFilters = {
  // Example dataset filters
  example: [
    {
      id: 'example_text_filter',
      label: 'Text Filter',
      type: FILTER_TYPES.TEXT,
      description: 'Example text filter'
    },
    {
      id: 'example_number_filter',
      label: 'Number Filter',
      type: FILTER_TYPES.NUMBER,
      min: 0,
      max: 100,
      description: 'Example number filter'
    }
  ]
};

// Map integration types to their filter sets
export const INTEGRATION_FILTERS = {
  'Autotask': autotaskFilters,
  'Autotask PSA': autotaskFilters,
  'autotask_psa': autotaskFilters, // Handle different case and format variations
  // Add more integrations as needed
  'Other': otherIntegrationFilters
};

// Map integration types to their filter sets are defined above

// Helper function to get available filters for a specific integration and dataset
export const getAvailableFilters = (integrationType, datasetName) => {
  // Default filters as fallback
  const defaultFilters = [
    {
      id: 'name',
      label: 'Name',
      type: FILTER_TYPES.TEXT,
      description: 'Filter by name'
    },
    {
      id: 'created_after',
      label: 'Created After',
      type: FILTER_TYPES.DATE,
      description: 'Filter items created after this date'
    },
    {
      id: 'created_before',
      label: 'Created Before',
      type: FILTER_TYPES.DATE,
      description: 'Filter items created before this date'
    }
  ];

  // If no integration type or dataset name, return default filters
  if (!integrationType || !datasetName) {
    return defaultFilters;
  }

  // Normalize inputs for case-insensitive comparison
  const normalizedIntegrationType = integrationType.toLowerCase();
  const normalizedDatasetName = datasetName.toLowerCase();

  // HIGHEST PRIORITY: Direct check for autotask_psa with Tickets dataset
  // This is the main case we want to handle correctly
  if ((normalizedIntegrationType === 'autotask_psa' || 
       normalizedIntegrationType === 'autotaskpsa' || 
       normalizedIntegrationType === 'autotask') && 
      normalizedDatasetName === 'tickets') {
    return autotaskFilters.Tickets;
  }

  // For any Autotask integration, try to get dataset-specific filters
  if (normalizedIntegrationType.includes('autotask')) {
    // Try to find matching dataset in autotaskFilters
    for (const key in autotaskFilters) {
      if (key.toLowerCase() === normalizedDatasetName) {
        return autotaskFilters[key];
      }
    }

    // Direct access as fallback
    if (autotaskFilters[datasetName]) {
      return autotaskFilters[datasetName];
    }
  }

  // Try to get filters for any other integration
  for (const key in INTEGRATION_FILTERS) {
    if (key.toLowerCase() === normalizedIntegrationType || 
        key.toLowerCase().replace(/[_\s]/g, '') === normalizedIntegrationType.replace(/[_\s]/g, '')) {
      const integrationFilters = INTEGRATION_FILTERS[key];

      // Try to find dataset in this integration's filters
      if (integrationFilters[datasetName]) {
        return integrationFilters[datasetName];
      }

      // Try case-insensitive match
      for (const datasetKey in integrationFilters) {
        if (datasetKey.toLowerCase() === normalizedDatasetName) {
          return integrationFilters[datasetKey];
        }
      }
    }
  }

  // If no match found, return default filters
  return defaultFilters;
};

// Helper function to render a filter input based on its type
export const renderFilterInput = (filter, value, onChange) => {
  // For dynamic options, check if we need to use the latest options
  const getLatestOptions = (filter) => {
    if (filter.dynamicOptions) {
      // Get the latest options from dynamicFilterOptions
      const latestOptions = dynamicFilterOptions[filter.id];
      if (latestOptions && latestOptions.length > 0) {
        return latestOptions;
      }

      // If no dynamic options are available, use fallback options
      if (filter.id === 'status') {
        return [
          { value: 1, label: 'New' },
          { value: 2, label: 'In Progress' },
          { value: 5, label: 'Complete' },
          { value: 7, label: 'Waiting Customer' },
          { value: 11, label: 'Waiting Materials' }
        ];
      } else if (filter.id === 'priority') {
        return [
          { value: 1, label: 'Low' },
          { value: 2, label: 'Medium' },
          { value: 3, label: 'High' },
          { value: 4, label: 'Critical' }
        ];
      } else if (filter.id === 'ticketType') {
        return [
          { value: 1, label: 'Service Request' },
          { value: 2, label: 'Incident' },
          { value: 3, label: 'Problem' }
        ];
      }
    }
    return filter.options;
  };

  switch (filter.type) {
    case FILTER_TYPES.TEXT:
      return (
        <TextField
          fullWidth
          label={filter.label}
          value={value || ''}
          onChange={(e) => onChange(filter.id, e.target.value)}
          margin="normal"
          helperText={filter.description}
        />
      );
    case FILTER_TYPES.NUMBER:
      return (
        <TextField
          fullWidth
          label={filter.label}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(filter.id, parseFloat(e.target.value))}
          margin="normal"
          InputProps={{ 
            inputProps: { 
              min: filter.min !== undefined ? filter.min : undefined, 
              max: filter.max !== undefined ? filter.max : undefined,
              step: filter.step !== undefined ? filter.step : undefined
            } 
          }}
          helperText={filter.description}
        />
      );
    case FILTER_TYPES.DATE:
      return (
        <TextField
          fullWidth
          label={filter.label}
          type="date"
          value={value || ''}
          onChange={(e) => onChange(filter.id, e.target.value)}
          margin="normal"
          InputLabelProps={{ shrink: true }}
          helperText={filter.description}
        />
      );
    case FILTER_TYPES.SELECT:
      // Get the latest options for this filter
      const options = getLatestOptions(filter);

      return (
        <FormControl fullWidth margin="normal">
          <InputLabel id={`${filter.id}-label`}>{filter.label}</InputLabel>
          <Select
            labelId={`${filter.id}-label`}
            value={value || ''}
            onChange={(e) => onChange(filter.id, e.target.value)}
            label={filter.label}
          >
            <MenuItem value="">Any</MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>{filter.description}</FormHelperText>
        </FormControl>
      );
    case FILTER_TYPES.BOOLEAN:
      return (
        <FormControl fullWidth margin="normal">
          <InputLabel id={`${filter.id}-label`}>{filter.label}</InputLabel>
          <Select
            labelId={`${filter.id}-label`}
            value={value === undefined ? '' : value}
            onChange={(e) => onChange(filter.id, e.target.value === '' ? undefined : e.target.value === 'true')}
            label={filter.label}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </Select>
          <FormHelperText>{filter.description}</FormHelperText>
        </FormControl>
      );
    default:
      return null;
  }
};
