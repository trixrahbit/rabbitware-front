import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  PlayArrow as RunIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import axios from 'axios';

/**
 * Component for displaying a list of alerts with actions
 */
function AlertList({ 
  alerts, 
  loading, 
  onRefresh, 
  onEdit, 
  onDelete, 
  onRunNow, 
  onViewHistory,
  error
}) {
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleDelete = async (id) => {
    if (deleteConfirmId === id) {
      await onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Auto-reset after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" color="success" size="small" />;
      case 'inactive':
        return <Chip label="Inactive" color="default" size="small" />;
      case 'error':
        return <Chip label="Error" color="error" size="small" />;
      default:
        return <Chip label={status} color="primary" size="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Configured Alerts</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={loading}
        >
          Refresh
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : alerts.length === 0 ? (
        <Alert severity="info">
          No alerts configured yet. Create your first alert to get started.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {alerts.map((alert) => (
            <Grid item xs={12} md={6} lg={4} key={alert.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                      {alert.name}
                    </Typography>
                    {getStatusChip(alert.status)}
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {alert.description || 'No description provided'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {alert.tags && alert.tags.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Source:</strong> {alert.data_source || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Frequency:</strong> {alert.frequency || 'Unknown'}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Last Run:</strong>{' '}
                    {alert.last_run ? new Date(alert.last_run).toLocaleString() : 'Never'}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="View History">
                      <IconButton 
                        size="small" 
                        onClick={() => onViewHistory(alert.id)}
                        aria-label="View history"
                      >
                        <HistoryIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Run Now">
                      <IconButton 
                        size="small" 
                        onClick={() => onRunNow(alert.id)}
                        aria-label="Run now"
                      >
                        <RunIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit">
                      <IconButton 
                        size="small" 
                        onClick={() => onEdit(alert.id)}
                        aria-label="Edit alert"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={deleteConfirmId === alert.id ? "Click again to confirm" : "Delete"}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(alert.id)}
                        color={deleteConfirmId === alert.id ? "error" : "default"}
                        aria-label="Delete alert"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default AlertList;