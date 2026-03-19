import React from 'react';
import {
  Box, Button, IconButton, TextField, MenuItem, Stack, Typography, Paper, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

const OPERATORS = [
  { value: 'eq', label: 'Equals' },
  { value: 'neq', label: 'Not Equals' },
  { value: 'gt', label: 'Greater Than' },
  { value: 'gte', label: 'Greater or Equal' },
  { value: 'lt', label: 'Less Than' },
  { value: 'lte', label: 'Less or Equal' },
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Not Contains' },
  { value: 'starts_with', label: 'Starts With' },
  { value: 'ends_with', label: 'Ends With' },
  { value: 'is_null', label: 'Is Empty' },
  { value: 'is_not_null', label: 'Is Not Empty' },
  { value: 'in', label: 'In List' },
  { value: 'between', label: 'Between' },
  { value: 'date_range', label: 'Date Range' },
];

const NO_VALUE_OPS = ['is_null', 'is_not_null'];
const DUAL_VALUE_OPS = ['between', 'date_range'];

const AdvancedFilterBuilder = ({ filters, onChange, fields }) => {
  const addFilter = () => {
    onChange([...filters, { field: '', operator: 'eq', value: '' }]);
  };

  const removeFilter = (index) => {
    onChange(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index, key, value) => {
    const updated = [...filters];
    updated[index] = { ...updated[index], [key]: value };
    // Reset value when operator changes
    if (key === 'operator') {
      if (DUAL_VALUE_OPS.includes(value)) {
        updated[index].value = ['', ''];
      } else if (NO_VALUE_OPS.includes(value)) {
        updated[index].value = null;
      } else {
        updated[index].value = '';
      }
    }
    onChange(updated);
  };

  const updateDualValue = (index, pos, val) => {
    const updated = [...filters];
    const current = Array.isArray(updated[index].value) ? [...updated[index].value] : ['', ''];
    current[pos] = val;
    updated[index] = { ...updated[index], value: current };
    onChange(updated);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2">Filters</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={addFilter} sx={{ textTransform: 'none' }}>
          Add Filter
        </Button>
      </Box>

      {filters.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 1 }}>
          No filters applied. Click "Add Filter" to add one.
        </Typography>
      )}

      <Stack spacing={1}>
        {filters.map((filter, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {/* Field selector */}
            {fields && fields.length > 0 ? (
              <TextField
                select size="small" label="Field" value={filter.field}
                onChange={(e) => updateFilter(index, 'field', e.target.value)}
                sx={{ minWidth: 140 }}
              >
                {fields.map((f) => (
                  <MenuItem key={f.name || f} value={f.name || f}>
                    {f.label || f.name || f}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                size="small" label="Field" value={filter.field}
                onChange={(e) => updateFilter(index, 'field', e.target.value)}
                sx={{ minWidth: 140 }}
              />
            )}

            {/* Operator */}
            <TextField
              select size="small" label="Operator" value={filter.operator}
              onChange={(e) => updateFilter(index, 'operator', e.target.value)}
              sx={{ minWidth: 140 }}
            >
              {OPERATORS.map((op) => (
                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
              ))}
            </TextField>

            {/* Value input(s) */}
            {NO_VALUE_OPS.includes(filter.operator) ? null : DUAL_VALUE_OPS.includes(filter.operator) ? (
              <>
                <TextField
                  size="small" label={filter.operator === 'date_range' ? 'Start' : 'Min'}
                  type={filter.operator === 'date_range' ? 'date' : 'text'}
                  InputLabelProps={filter.operator === 'date_range' ? { shrink: true } : undefined}
                  value={Array.isArray(filter.value) ? filter.value[0] || '' : ''}
                  onChange={(e) => updateDualValue(index, 0, e.target.value)}
                  sx={{ minWidth: 120 }}
                />
                <TextField
                  size="small" label={filter.operator === 'date_range' ? 'End' : 'Max'}
                  type={filter.operator === 'date_range' ? 'date' : 'text'}
                  InputLabelProps={filter.operator === 'date_range' ? { shrink: true } : undefined}
                  value={Array.isArray(filter.value) ? filter.value[1] || '' : ''}
                  onChange={(e) => updateDualValue(index, 1, e.target.value)}
                  sx={{ minWidth: 120 }}
                />
              </>
            ) : (
              <TextField
                size="small" label="Value" value={filter.value || ''}
                onChange={(e) => updateFilter(index, 'value', e.target.value)}
                sx={{ minWidth: 140 }}
              />
            )}

            <IconButton size="small" onClick={() => removeFilter(index)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      {filters.length > 0 && (
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {filters.filter(f => f.field).map((f, i) => (
            <Chip key={i} size="small" label={`${f.field} ${f.operator} ${Array.isArray(f.value) ? f.value.join(' - ') : f.value || ''}`}
                  onDelete={() => removeFilter(i)} />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default AdvancedFilterBuilder;
