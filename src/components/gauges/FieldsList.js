import React from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Button
} from '@mui/material';
import {
  Numbers as NumbersIcon,
  Category as CategoryIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  FilterAlt as FilterAltIcon,
  Storage as StorageIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

/**
 * Component for displaying and interacting with data source fields
 */
function FieldsList({
  fields,
  loading,
  onAddField,
  onRefresh
}) {
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Loading fields...
        </Typography>
      </Box>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4
      }}>
        <StorageIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          No fields available from this data source.
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          onClick={onRefresh}
          startIcon={<RefreshIcon />}
          sx={{ mt: 2 }}
        >
          Load Fields
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filter chips */}
      <Box sx={{ 
        display: 'flex', 
        gap: 1, 
        mb: 2,
        flexWrap: 'wrap'
      }}>
        <Chip 
          label="All Fields" 
          color="primary" 
          variant="filled" 
          size="small"
          onClick={() => {}}
        />
        <Chip 
          label="Measures" 
          icon={<NumbersIcon />} 
          variant="outlined" 
          size="small"
          onClick={() => {}}
        />
        <Chip 
          label="Dimensions" 
          icon={<CategoryIcon />} 
          variant="outlined" 
          size="small"
          onClick={() => {}}
        />
      </Box>

      {/* Fields list with cards */}
      <Box sx={{ 
        maxHeight: 400, 
        overflow: 'auto',
        pr: 1
      }}>
        {fields.map((field) => (
          <Paper
            key={field.name}
            variant="outlined"
            sx={{ 
              p: 1.5, 
              mb: 1,
              borderRadius: 1,
              '&:hover': {
                boxShadow: 1,
                bgcolor: 'background.paper'
              }
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {field.type === 'measure' ? 
                  <NumbersIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} /> : 
                  <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'secondary.main' }} />
                }
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    {field.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {field.type} • {field.dataType}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex' }}>
                <Tooltip title="Add as Measure">
                  <span> {/* Wrapper to handle disabled state */}
                    <IconButton 
                      size="small"
                      onClick={() => onAddField(field, 'measure')}
                      disabled={field.type !== 'measure'}
                      color="primary"
                      sx={{ 
                        '&.Mui-disabled': { 
                          color: 'action.disabled',
                          opacity: 0.3
                        }
                      }}
                    >
                      <AddCircleOutlineIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Add as Dimension">
                  <IconButton 
                    size="small"
                    onClick={() => onAddField(field, 'dimension')}
                    color="secondary"
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Add as Filter">
                  <IconButton 
                    size="small"
                    onClick={() => onAddField(field, 'filter')}
                    color="default"
                  >
                    <FilterAltIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

export default FieldsList;